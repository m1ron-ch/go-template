// Copyright (c) 2024 m1ron
//
// Author: m1ron (https://github.com/m1ron-ch)
// Licensed under the MIT License.
// See LICENSE file in the project root for full license information.

package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"main/internal/config"
	"reflect"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// Database обёртка над *sql.DB, тут можно добавить поля для логирования, метрик и т.п.
type Database struct {
	conn *sql.DB
}

// New создаёт новое подключение к базе данных и возвращает структуру Database.
// Можно расширить (например, добавить поддержку DSN из строки).
func New(cfg config.DBConfig) (*Database, error) {
	db, err := openDB(cfg)
	if err != nil {
		return nil, err
	}
	return &Database{conn: db}, nil
}

// Close закрывает соединение с БД
func (h *Database) Close() {
	if h.conn != nil {
		if err := h.conn.Close(); err != nil {
			log.Printf("[ERROR] closing DB: %v\n", err)
		}
	}
}

// openDB формирует DSN и открывает соединение с БД
func openDB(cfg config.DBConfig) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci",
		cfg.Username,
		cfg.Password,
		cfg.Hostname,
		cfg.Port,
		cfg.DBName,
	)

	fmt.Println(dsn)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// Настройка пула соединений
	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(100)
	db.SetMaxIdleConns(100)

	// Проверяем соединение
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// Conn возвращает *sql.DB (иногда нужно для ручных операций)
func (h *Database) Conn() *sql.DB {
	return h.conn
}

// ----------------------------------------------------------------------------
//                               ТРАНЗАКЦИИ
// ----------------------------------------------------------------------------

// WithTransaction - обёртка, которая открывает транзакцию, выполняет переданную функцию
// и в случае успеха коммитит, в случае ошибки откатывает.
// Можно указывать уровень изоляции (по умолчанию sql.LevelReadCommitted).
func (h *Database) WithTransaction(
	ctx context.Context,
	isoLevel sql.IsolationLevel,
	fn func(tx *sql.Tx) error,
) (err error) {
	if isoLevel == 0 {
		isoLevel = sql.LevelReadCommitted
	}

	tx, err := h.conn.BeginTx(ctx, &sql.TxOptions{Isolation: isoLevel})
	if err != nil {
		return fmt.Errorf("begin tx error: %w", err)
	}

	// defer-функция гарантирует, что при panic() или при ошибке err != nil
	// мы сделаем ROLLBACK, иначе COMMIT
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		} else {
			err = tx.Commit()
		}
	}()

	err = fn(tx)
	return err
}

// ----------------------------------------------------------------------------
//    ФУНКЦИЯ-ОБЁРТКА ДЛЯ ВЫБОРОК: МГНОВЕННО В СЛАЙС СТРУКТУР (Через дженерики)
// ----------------------------------------------------------------------------

// SelectDataUniversalStruct позволяет выбрать данные из таблицы сразу в срез структур.
// - db: ссылка на *sql.DB или *sql.Tx (внутри транзакции).
// - T: любая структура, имеющая теги `db:"column_name"`.
// - tableName: имя таблицы.
// - columns: список столбцов (если пусто, будет SELECT *).
// - conditions: map[поле]значение для WHERE (формируется " AND ").
// - additionalClauses: ORDER BY, GROUP BY, LIMIT и т.д.
// - args: дополнительные параметры, если в additionalClauses есть PLACEHOLDERS (?).
//
// Возвращает []T (уже заполненный данными) и ошибку, если что-то пошло не так.
func SelectDataUniversalStruct[T any](
	ctx context.Context,
	db *sql.DB,
	tableName string,
	columns []string,
	conditions map[string]interface{},
	additionalClauses string,
	args ...interface{},
) ([]T, error) {
	if tableName == "" {
		return nil, errors.New("tableName cannot be empty")
	}

	// Формируем часть с колонками
	colPart := "*"
	if len(columns) > 0 {
		colPart = strings.Join(columns, ", ")
	}

	// Начинаем строить запрос
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("SELECT %s FROM %s", colPart, tableName))

	// WHERE
	var vals []interface{}
	if len(conditions) > 0 {
		sb.WriteString(" WHERE ")
		var condParts []string
		for col, val := range conditions {
			condParts = append(condParts, fmt.Sprintf("%s = ?", col))
			vals = append(vals, val)
		}
		sb.WriteString(strings.Join(condParts, " AND "))
	}

	// Дополнительные конструкции (ORDER BY, LIMIT, GROUP BY)
	if additionalClauses != "" {
		sb.WriteRune(' ')
		sb.WriteString(additionalClauses)
	}

	// Добавляем переданные args (например, для "LIMIT ?")
	vals = append(vals, args...)

	query := sb.String()
	log.Printf("[DEBUG] SelectDataUniversalStruct query=%q vals=%v\n", query, vals)

	rows, err := db.QueryContext(ctx, query, vals...)
	if err != nil {
		return nil, fmt.Errorf("query error: %w", err)
	}
	defer rows.Close()

	// Получаем названия столбцов
	colNames, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	var result []T
	for rows.Next() {
		rawValues := make([]interface{}, len(colNames))
		scanArgs := make([]interface{}, len(colNames))
		for i := range rawValues {
			scanArgs[i] = &rawValues[i]
		}

		if err := rows.Scan(scanArgs...); err != nil {
			return nil, fmt.Errorf("scan error: %w", err)
		}

		// Маппим в структуру
		var rowStruct T
		if err := mapRowToStruct(rawValues, colNames, &rowStruct); err != nil {
			return nil, fmt.Errorf("mapRowToStruct error: %w", err)
		}
		result = append(result, rowStruct)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return result, nil
}

// FindOneStruct — если нужно получить ровно одну запись в структуру T.
// Ошибка, если строк не ровно одна (например, 0 или >1).
// Можно адаптировать логику под «0 строк = nil, >1 строка = ошибка» и т.д.
func FindOneStruct[T any](
	ctx context.Context,
	db *sql.DB,
	tableName string,
	columns []string,
	conditions map[string]interface{},
	additionalClauses string,
	args ...interface{},
) (*T, error) {
	results, err := SelectDataUniversalStruct[T](ctx, db, tableName, columns, conditions, additionalClauses, args...)
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, sql.ErrNoRows
	}
	if len(results) > 1 {
		return nil, fmt.Errorf("expected exactly 1 row, got %d", len(results))
	}
	return &results[0], nil
}

// mapRowToStruct сопоставляет значения из строки (rawValues) с полями структуры outStruct.
// Ищет теги вида `db:"column_name"`. Если у поля нет тега, оно пропускается.
func mapRowToStruct(rawValues []interface{}, colNames []string, outStruct interface{}) error {
	v := reflect.ValueOf(outStruct)
	if v.Kind() != reflect.Ptr || v.Elem().Kind() != reflect.Struct {
		return errors.New("outStruct must be a pointer to a struct")
	}
	structVal := v.Elem()
	structType := structVal.Type()

	// colIndexMap: colName -> index in rawValues
	colIndexMap := make(map[string]int)
	for i, colName := range colNames {
		colIndexMap[colName] = i
	}

	// Перебираем поля структуры
	for i := 0; i < structType.NumField(); i++ {
		fieldType := structType.Field(i)
		fieldVal := structVal.Field(i)

		if !fieldVal.CanSet() {
			continue
		}
		tagValue := fieldType.Tag.Get("db")
		if tagValue == "" {
			// Поле не привязано к столбцу
			continue
		}

		idx, ok := colIndexMap[tagValue]
		if !ok {
			// Такого столбца нет в выборке
			continue
		}

		rawVal := rawValues[idx]
		if rawVal == nil {
			// NULL в БД, можно присвоить zero-value или пропустить
			continue
		}

		// []byte -> string
		if b, ok := rawVal.([]byte); ok && fieldVal.Kind() == reflect.String {
			fieldVal.SetString(string(b))
			continue
		}

		srcVal := reflect.ValueOf(rawVal)
		if srcVal.Type().ConvertibleTo(fieldVal.Type()) {
			fieldVal.Set(srcVal.Convert(fieldVal.Type()))
		} else {
			log.Printf("[WARN] cannot convert %v (type %T) to field %s (type %s)\n",
				rawVal, rawVal, fieldType.Name, fieldVal.Type().String())
		}
	}
	return nil
}

// ----------------------------------------------------------------------------
//           СПЕЦИАЛИЗИРОВАННЫЕ МЕТОДЫ SELECT (возвращают *sql.Rows)
// ----------------------------------------------------------------------------

func (h *Database) SelectDataUniversal(
	ctx context.Context,
	tableName string,
	columns []string,
	conditions map[string]interface{},
	additionalClauses string,
	args ...interface{},
) (*sql.Rows, error) {
	if tableName == "" {
		return nil, errors.New("tableName cannot be empty")
	}

	colPart := "*"
	if len(columns) > 0 {
		colPart = strings.Join(columns, ", ")
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("SELECT %s FROM %s", colPart, tableName))

	var vals []interface{}
	if len(conditions) > 0 {
		sb.WriteString(" WHERE ")
		var condParts []string
		for col, val := range conditions {
			condParts = append(condParts, fmt.Sprintf("%s = ?", col))
			vals = append(vals, val)
		}
		sb.WriteString(strings.Join(condParts, " AND "))
	}

	if additionalClauses != "" {
		sb.WriteRune(' ')
		sb.WriteString(additionalClauses)
	}

	vals = append(vals, args...)
	query := sb.String()

	log.Printf("[DEBUG] SelectDataUniversal query=%q vals=%v\n", query, vals)
	rows, err := h.conn.QueryContext(ctx, query, vals...)
	if err != nil {
		return nil, fmt.Errorf("SelectDataUniversal query error: %w", err)
	}
	return rows, nil
}

// SelectAllData пример: получить все данные из таблицы (без условий, без доп. клауз)
func (h *Database) SelectAllData(ctx context.Context, tableName string) (*sql.Rows, error) {
	return h.SelectDataUniversal(ctx, tableName, nil, nil, "")
}

// SelectDataByColumns пример: получить только нужные столбцы
func (h *Database) SelectDataByColumns(ctx context.Context, tableName string, columns []string) (*sql.Rows, error) {
	return h.SelectDataUniversal(ctx, tableName, columns, nil, "")
}

// SelectDataWithConditions пример: нужные столбцы + WHERE
func (h *Database) SelectDataWithConditions(
	ctx context.Context,
	tableName string,
	columns []string,
	conditions map[string]interface{},
) (*sql.Rows, error) {
	return h.SelectDataUniversal(ctx, tableName, columns, conditions, "")
}

// SelectData пример: когда условий одно и столбцы заданы
func (h *Database) SelectData(
	ctx context.Context,
	tableName string,
	columns []string,
	conditionColumn string,
	conditionValue interface{},
) (*sql.Rows, error) {
	cond := map[string]interface{}{
		conditionColumn: conditionValue,
	}
	return h.SelectDataUniversal(ctx, tableName, columns, cond, "")
}

// ----------------------------------------------------------------------------
//                  ПРОВЕРКА СУЩЕСТВОВАНИЯ / COUNT
// ----------------------------------------------------------------------------

// DoesDataExist проверяет, есть ли хотя бы одна строка, удовлетворяющая conditions
func (h *Database) DoesDataExist(ctx context.Context, tableName string, conditions map[string]interface{}) (bool, error) {
	if tableName == "" {
		return false, fmt.Errorf("tableName is empty")
	}

	var whereClauses []string
	var values []interface{}

	for column, value := range conditions {
		whereClauses = append(whereClauses, fmt.Sprintf("%s = ?", column))
		values = append(values, value)
	}

	query := fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM %s WHERE %s)",
		tableName,
		strings.Join(whereClauses, " AND "),
	)

	var exists bool
	err := h.conn.QueryRowContext(ctx, query, values...).Scan(&exists)
	if err != nil {
		log.Printf("[ERROR] DoesDataExist: %v\n", err)
		return false, err
	}
	return exists, nil
}

// CountData считает количество строк в таблице, удовлетворя (опциональному) where
func (h *Database) CountData(ctx context.Context, tableName, where string, args ...interface{}) (int, error) {
	if tableName == "" {
		return 0, fmt.Errorf("tableName is empty")
	}
	if where != "" && !strings.HasPrefix(strings.ToUpper(strings.TrimSpace(where)), "WHERE") {
		where = "WHERE " + where
	}

	query := fmt.Sprintf("SELECT COUNT(*) FROM %s %s", tableName, where)
	log.Printf("[DEBUG] CountData query=%q args=%v\n", query, args)

	var count int
	err := h.conn.QueryRowContext(ctx, query, args...).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// ----------------------------------------------------------------------------
//         УНИВЕРСАЛЬНЫЕ ОПЕРАЦИИ INSERT, UPDATE, DELETE (без транзакций)
// ----------------------------------------------------------------------------

// InsertData выполняет INSERT и возвращает ID последней вставленной записи.
// При необходимости можно выполнять внутри транзакции, если нужно.
func (h *Database) InsertData(ctx context.Context, tableName string, data map[string]interface{}) (int64, error) {
	if tableName == "" {
		return 0, fmt.Errorf("tableName is empty")
	}
	if len(data) == 0 {
		return 0, fmt.Errorf("no data to insert")
	}

	var (
		columns      []string
		placeholders []string
		values       []interface{}
	)

	for column, value := range data {
		columns = append(columns, column)
		placeholders = append(placeholders, "?")
		values = append(values, value)
	}

	columnsString := strings.Join(columns, ", ")
	placeholdersString := strings.Join(placeholders, ", ")
	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", tableName, columnsString, placeholdersString)

	log.Printf("[DEBUG] InsertData query=%q values=%v\n", query, values)

	stmt, err := h.conn.PrepareContext(ctx, query)
	if err != nil {
		return 0, fmt.Errorf("InsertData Prepare error: %w", err)
	}
	defer stmt.Close()

	result, err := stmt.ExecContext(ctx, values...)
	if err != nil {
		return 0, fmt.Errorf("InsertData Exec error: %w", err)
	}

	lastID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("InsertData LastInsertId error: %w", err)
	}
	return lastID, nil
}

// UpdateData выполняет UPDATE по условиям conditions (WHERE col=?).
// Возвращает количество затронутых строк.
func (h *Database) UpdateData(ctx context.Context, tableName string, data map[string]interface{}, conditions map[string]interface{}) (int64, error) {
	if tableName == "" {
		return 0, fmt.Errorf("tableName is empty")
	}
	if len(data) == 0 {
		return 0, fmt.Errorf("no data to update")
	}
	if len(conditions) == 0 {
		return 0, fmt.Errorf("no conditions for update")
	}

	var (
		setStatements   []string
		values          []interface{}
		whereStatements []string
	)

	for column, value := range data {
		setStatements = append(setStatements, fmt.Sprintf("%s = ?", column))
		values = append(values, value)
	}
	setClause := strings.Join(setStatements, ", ")

	for column, value := range conditions {
		whereStatements = append(whereStatements, fmt.Sprintf("%s = ?", column))
		values = append(values, value)
	}
	whereClause := strings.Join(whereStatements, " AND ")

	query := fmt.Sprintf("UPDATE %s SET %s WHERE %s", tableName, setClause, whereClause)
	log.Printf("[DEBUG] UpdateData query=%q values=%v\n", query, values)

	result, err := h.conn.ExecContext(ctx, query, values...)
	if err != nil {
		return 0, fmt.Errorf("UpdateData Exec error: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("UpdateData RowsAffected error: %w", err)
	}
	return rowsAffected, nil
}

// DeleteData выполняет DELETE по условиям conditions (WHERE col=?).
// Возвращает количество затронутых строк.
func (h *Database) DeleteData(ctx context.Context, tableName string, conditions map[string]interface{}) (int64, error) {
	if tableName == "" {
		return 0, fmt.Errorf("tableName is empty")
	}
	if len(conditions) == 0 {
		return 0, fmt.Errorf("no conditions for delete")
	}

	var (
		whereStatements []string
		values          []interface{}
	)

	for column, value := range conditions {
		whereStatements = append(whereStatements, fmt.Sprintf("%s = ?", column))
		values = append(values, value)
	}
	whereClause := strings.Join(whereStatements, " AND ")

	query := fmt.Sprintf("DELETE FROM %s WHERE %s", tableName, whereClause)
	log.Printf("[DEBUG] DeleteData query=%q values=%v\n", query, values)

	result, err := h.conn.ExecContext(ctx, query, values...)
	if err != nil {
		return 0, fmt.Errorf("DeleteData Exec error: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, fmt.Errorf("DeleteData RowsAffected error: %w", err)
	}
	return rowsAffected, nil
}

// ----------------------------------------------------------------------------
//                     ПОЛНОСТЬЮ СВОБОДНЫЙ SELECT/EXEC
// ----------------------------------------------------------------------------

// SelectSimple — для выполнения абсолютно кастомных SELECT-запросов.
// Вы всегда можете написать что угодно, например JOIN нескольких таблиц, группировки и т.д.
func (h *Database) SelectSimple(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error) {
	log.Printf("[DEBUG] SelectSimple query=%q args=%v\n", query, args)
	rows, err := h.conn.QueryContext(ctx, query, args...)
	if err != nil {
		log.Printf("[ERROR] SelectSimple: %v\n", err)
		return nil, err
	}
	return rows, nil
}

// ExecSimple — для выполнения абсолютно кастомных запросов (INSERT, UPDATE, DELETE, DDL).
func (h *Database) ExecSimple(ctx context.Context, query string, args ...interface{}) (sql.Result, error) {
	log.Printf("[DEBUG] ExecSimple query=%q args=%v\n", query, args)
	result, err := h.conn.ExecContext(ctx, query, args...)
	if err != nil {
		log.Printf("[ERROR] ExecSimple: %v\n", err)
		return nil, err
	}
	return result, nil
}
