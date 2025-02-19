package mysql

import (
	"database/sql"
	"fmt"
	"main/internal/domain/leaked"
	"main/internal/domain/user"
	utility "main/internal/utils"
	"sort"
	"time"
)

type LeakedRepository struct {
	db *sql.DB
}

func NewLeakedRepository(db *sql.DB) leaked.Repository {
	return &LeakedRepository{db: db}
}

// ----------------------------------------------------
// GetAll - already implemented (for reference)
// ----------------------------------------------------
func (r *LeakedRepository) GetAll() ([]leaked.Leaked, error) {
	query := `
        SELECT
            l.id,
            l.status,
            l.blog,
            l.created_at,
            l.company_name,
            l.description,
            l.website,
            l.expires,
            l.logo_url,
            l.payout,
            l.payout_unit,
						l.builder,
						l.publish,
						l.is_accept,
            u.uid,
            u.login,
						u.role_id,
            ls.id AS screenshot_id,
            ls.screenshot_url,
            lu.id AS url_id,
            lu.url
        FROM leaked l
        INNER JOIN users u ON u.uid = l.user_id
        LEFT JOIN leaked_screenshots ls ON ls.leaked_id = l.id
        LEFT JOIN leaked_urls lu ON lu.leaked_id = l.id
        ORDER BY l.id DESC;
    `
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	leakedMap := make(map[int]*leaked.Leaked)

	for rows.Next() {
		var (
			id            int
			status        int
			blog          string
			createdAt     time.Time
			companyName   string
			description   string
			website       sql.NullString
			expires       sql.NullTime
			logoUrl       sql.NullString
			payout        float64
			payoutUnit    int
			userUID       int
			userLogin     string
			screenshotID  sql.NullInt64
			screenshotURL sql.NullString
			urlID         sql.NullInt64
			url           sql.NullString
			builder       int
			publish       int
			roleID        int
			isAccept      int
		)

		if err := rows.Scan(
			&id, &status, &blog, &createdAt, &companyName, &description,
			&website, &expires, &logoUrl, &payout, &payoutUnit, &builder, &publish, &isAccept,
			&userUID, &userLogin, &roleID, &screenshotID, &screenshotURL, &urlID, &url,
		); err != nil {
			return nil, fmt.Errorf("rows.Scan failed: %w", err)
		}

		l, exists := leakedMap[id]
		if !exists {
			l = &leaked.Leaked{
				ID:          id,
				Status:      status,
				Blog:        blog,
				CreateAt:    createdAt,
				CompanyName: companyName,
				Description: description,
				Website:     website.String,
				LogoUrl:     logoUrl.String,
				Payout:      payout,
				PayoutUnit:  payoutUnit,
				Builder:     builder,
				Publish:     publish,
				IsAccept:    isAccept,
				User: user.User{
					ID:     int64(userUID),
					Login:  userLogin,
					RoleID: roleID,
				},
				Screenshots: make([]leaked.LeakedScreenshot, 0),
				Links:       make([]leaked.LeakedUrls, 0),
			}
			if expires.Valid {
				l.Expires = &expires.Time
			}
			l.CreatedAtStr = createdAt.Format("2006-01-02 15:04:05")
			if expires.Valid {
				l.ExpiresStr = expires.Time.Format("2006-01-02 15:04:05")
			} else {
				l.ExpiresStr = ""
			}
			leakedMap[id] = l
		}

		// Screenshots
		if screenshotID.Valid && screenshotURL.Valid {
			found := false
			for _, scr := range l.Screenshots {
				if scr.ID == int(screenshotID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Screenshots = append(l.Screenshots, leaked.LeakedScreenshot{
					ID:       int(screenshotID.Int64),
					ImageURL: screenshotURL.String,
				})
			}
		}

		// Links
		if urlID.Valid && url.Valid {
			found := false
			for _, link := range l.Links {
				if link.ID == int(urlID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Links = append(l.Links, leaked.LeakedUrls{
					ID:  int(urlID.Int64),
					Url: url.String,
				})
			}
		}
	}

	var result []leaked.Leaked
	for _, l := range leakedMap {
		result = append(result, *l)
	}

	// Сортировка по убыванию ID
	sort.Slice(result, func(i, j int) bool {
		return result[i].ID > result[j].ID
	})

	return result, nil
}

func (r *LeakedRepository) GetAllActive() ([]leaked.Leaked, error) {
	query := `
        SELECT
            l.id,
            l.status,
            l.blog,
            l.created_at,
            l.company_name,
            l.description,
            l.website,
            l.expires,
            l.logo_url,
            l.payout,
            l.payout_unit,
			l.builder,
			l.publish,
            u.uid,
            u.login,
            ls.id AS screenshot_id,
            ls.screenshot_url,
            lu.id AS url_id,
            lu.url
        FROM leaked l
        INNER JOIN users u ON u.uid = l.user_id
        LEFT JOIN leaked_screenshots ls ON ls.leaked_id = l.id
        LEFT JOIN leaked_urls lu ON lu.leaked_id = l.id
				WHERE l.publish = 1 AND l.is_accept = 1
        ORDER BY l.id DESC;
    `
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	leakedMap := make(map[int]*leaked.Leaked)

	for rows.Next() {
		var (
			id            int
			status        int
			blog          string
			createdAt     time.Time
			companyName   string
			description   string
			website       sql.NullString
			expires       sql.NullTime
			logoUrl       sql.NullString
			payout        float64
			payoutUnit    int
			userUID       int
			userLogin     string
			screenshotID  sql.NullInt64
			screenshotURL sql.NullString
			urlID         sql.NullInt64
			url           sql.NullString
			builder       int
			publish       int
		)

		if err := rows.Scan(
			&id, &status, &blog, &createdAt, &companyName, &description,
			&website, &expires, &logoUrl, &payout, &payoutUnit, &builder, &publish,
			&userUID, &userLogin, &screenshotID, &screenshotURL, &urlID, &url,
		); err != nil {
			return nil, fmt.Errorf("rows.Scan failed: %w", err)
		}

		l, exists := leakedMap[id]
		if !exists {
			l = &leaked.Leaked{
				ID:          id,
				Status:      status,
				Blog:        blog,
				CreateAt:    createdAt,
				CompanyName: companyName,
				Description: description,
				Website:     website.String,
				LogoUrl:     logoUrl.String,
				Payout:      payout,
				PayoutUnit:  payoutUnit,
				Builder:     builder,
				Publish:     publish,
				User: user.User{
					ID:    int64(userUID),
					Login: userLogin,
				},
				Screenshots: make([]leaked.LeakedScreenshot, 0),
				Links:       make([]leaked.LeakedUrls, 0),
			}
			if expires.Valid {
				l.Expires = &expires.Time
			}
			l.CreatedAtStr = createdAt.Local().Format("2006-01-02 15:04:05")
			if expires.Valid {
				l.ExpiresStr = expires.Time.Local().Format("2006-01-02 15:04:05")
			} else {
				l.ExpiresStr = ""
			}
			leakedMap[id] = l
		}

		// Screenshots
		if screenshotID.Valid && screenshotURL.Valid {
			found := false
			for _, scr := range l.Screenshots {
				if scr.ID == int(screenshotID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Screenshots = append(l.Screenshots, leaked.LeakedScreenshot{
					ID:       int(screenshotID.Int64),
					ImageURL: screenshotURL.String,
				})
			}
		}

		// Links
		if urlID.Valid && url.Valid {
			found := false
			for _, link := range l.Links {
				if link.ID == int(urlID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Links = append(l.Links, leaked.LeakedUrls{
					ID:  int(urlID.Int64),
					Url: url.String,
				})
			}
		}
	}

	var result []leaked.Leaked
	for _, l := range leakedMap {
		result = append(result, *l)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].ID > result[j].ID
	})

	return result, nil
}

func (r *LeakedRepository) GetAllUnActive(userID int) ([]leaked.Leaked, error) {
	query := `
        SELECT
            l.id,
            l.status,
            l.blog,
            l.created_at,
            l.company_name,
            l.description,
            l.website,
            l.expires,
            l.logo_url,
            l.payout,
            l.payout_unit,
						l.builder,
						l.publish,
            u.uid,
            u.login,
            ls.id AS screenshot_id,
            ls.screenshot_url,
            lu.id AS url_id,
            lu.url
        FROM leaked l
        INNER JOIN users u ON u.uid = l.user_id
        LEFT JOIN leaked_screenshots ls ON ls.leaked_id = l.id
        LEFT JOIN leaked_urls lu ON lu.leaked_id = l.id
				WHERE l.expires >= NOW()
        ORDER BY l.id DESC;
    `
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	leakedMap := make(map[int]*leaked.Leaked)

	for rows.Next() {
		var (
			id            int
			status        int
			blog          string
			createdAt     time.Time
			companyName   string
			description   string
			website       sql.NullString
			expires       sql.NullTime
			logoUrl       sql.NullString
			payout        float64
			payoutUnit    int
			userUID       int
			userLogin     string
			screenshotID  sql.NullInt64
			screenshotURL sql.NullString
			urlID         sql.NullInt64
			url           sql.NullString
			builder       int
			publish       int
		)

		if err := rows.Scan(
			&id, &status, &blog, &createdAt, &companyName, &description,
			&website, &expires, &logoUrl, &payout, &payoutUnit, &builder, &publish,
			&userUID, &userLogin, &screenshotID, &screenshotURL, &urlID, &url,
		); err != nil {
			return nil, fmt.Errorf("rows.Scan failed: %w", err)
		}

		l, exists := leakedMap[id]
		if !exists {
			l = &leaked.Leaked{
				ID:          id,
				Status:      status,
				Blog:        blog,
				CreateAt:    createdAt,
				CompanyName: companyName,
				Description: description,
				Website:     website.String,
				LogoUrl:     logoUrl.String,
				Payout:      payout,
				PayoutUnit:  payoutUnit,
				Builder:     builder,
				Publish:     publish,
				User: user.User{
					ID:    int64(userUID),
					Login: userLogin,
				},
				Screenshots: make([]leaked.LeakedScreenshot, 0),
				Links:       make([]leaked.LeakedUrls, 0),
			}
			if expires.Valid {
				l.Expires = &expires.Time
			}
			l.CreatedAtStr = createdAt.Local().Format("2006-01-02 15:04:05")
			if expires.Valid {
				l.ExpiresStr = expires.Time.Local().Format("2006-01-02 15:04:05")
			} else {
				l.ExpiresStr = ""
			}
			leakedMap[id] = l
		}

		// Screenshots
		if screenshotID.Valid && screenshotURL.Valid {
			found := false
			for _, scr := range l.Screenshots {
				if scr.ID == int(screenshotID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Screenshots = append(l.Screenshots, leaked.LeakedScreenshot{
					ID:       int(screenshotID.Int64),
					ImageURL: screenshotURL.String,
				})
			}
		}

		// Links
		if urlID.Valid && url.Valid {
			found := false
			for _, link := range l.Links {
				if link.ID == int(urlID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Links = append(l.Links, leaked.LeakedUrls{
					ID:  int(urlID.Int64),
					Url: url.String,
				})
			}
		}
	}

	var result []leaked.Leaked
	for _, l := range leakedMap {
		result = append(result, *l)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].ID > result[j].ID
	})

	return result, nil
}

func (r *LeakedRepository) GetAllCapmaingByUserID(userID int) ([]leaked.Leaked, error) {
	query := fmt.Sprintf(`
        SELECT
            l.id,
            l.status,
            l.blog,
            l.created_at,
            l.company_name,
            l.description,
            l.website,
            l.expires,
            l.logo_url,
            l.payout,
            l.payout_unit,
						l.builder,
						l.publish,
						l.is_accept,
            u.uid,
            u.login,
            ls.id AS screenshot_id,
            ls.screenshot_url,
            lu.id AS url_id,
            lu.url
        FROM leaked l
        INNER JOIN users u ON u.uid = l.user_id
        LEFT JOIN leaked_screenshots ls ON ls.leaked_id = l.id
        LEFT JOIN leaked_urls lu ON lu.leaked_id = l.id
				WHERE l.user_id = %d
        ORDER BY l.id DESC;
    `, userID)
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	leakedMap := make(map[int]*leaked.Leaked)

	for rows.Next() {
		var (
			id            int
			status        int
			blog          string
			createdAt     time.Time
			companyName   string
			description   string
			website       sql.NullString
			expires       sql.NullTime
			logoUrl       sql.NullString
			payout        float64
			payoutUnit    int
			userUID       int
			userLogin     string
			screenshotID  sql.NullInt64
			screenshotURL sql.NullString
			urlID         sql.NullInt64
			url           sql.NullString
			builder       int
			publish       int
			isAccept      int
		)

		if err := rows.Scan(
			&id, &status, &blog, &createdAt, &companyName, &description,
			&website, &expires, &logoUrl, &payout, &payoutUnit, &builder, &publish, &isAccept,
			&userUID, &userLogin, &screenshotID, &screenshotURL, &urlID, &url,
		); err != nil {
			return nil, fmt.Errorf("rows.Scan failed: %w", err)
		}

		l, exists := leakedMap[id]
		if !exists {
			l = &leaked.Leaked{
				ID:          id,
				Status:      status,
				Blog:        blog,
				CreateAt:    createdAt,
				CompanyName: companyName,
				Description: description,
				Website:     website.String,
				LogoUrl:     logoUrl.String,
				Payout:      payout,
				PayoutUnit:  payoutUnit,
				Builder:     builder,
				Publish:     publish,
				IsAccept:    isAccept,
				User: user.User{
					ID:    int64(userUID),
					Login: userLogin,
				},
				Screenshots: make([]leaked.LeakedScreenshot, 0),
				Links:       make([]leaked.LeakedUrls, 0),
			}
			if expires.Valid {
				l.Expires = &expires.Time
			}
			l.CreatedAtStr = createdAt.Format("2006-01-02 15:04:05")
			if expires.Valid {
				l.ExpiresStr = expires.Time.Format("2006-01-02 15:04:05")
			} else {
				l.ExpiresStr = ""
			}

			leakedMap[id] = l
		}

		// Screenshots
		if screenshotID.Valid && screenshotURL.Valid {
			found := false
			for _, scr := range l.Screenshots {
				if scr.ID == int(screenshotID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Screenshots = append(l.Screenshots, leaked.LeakedScreenshot{
					ID:       int(screenshotID.Int64),
					ImageURL: screenshotURL.String,
				})
			}
		}

		// Links
		if urlID.Valid && url.Valid {
			found := false
			for _, link := range l.Links {
				if link.ID == int(urlID.Int64) {
					found = true
					break
				}
			}
			if !found {
				l.Links = append(l.Links, leaked.LeakedUrls{
					ID:  int(urlID.Int64),
					Url: url.String,
				})
			}
		}
	}

	var result []leaked.Leaked
	for _, l := range leakedMap {
		result = append(result, *l)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].ID > result[j].ID
	})

	return result, nil
}

// ----------------------------------------------------
// GetByID
// ----------------------------------------------------
// Retrieves a single Leaked item (including screenshots and links) by its ID.
func (r *LeakedRepository) GetByID(leakedID int) (*leaked.Leaked, error) {
	query := `
        SELECT
            l.id,
            l.status,
            l.blog,
            l.created_at,
            l.company_name,
            l.description,
            l.website,
            l.expires,
            l.logo_url,
            l.payout,
            l.payout_unit,
						l.builder,
						l.publish,
            u.uid,
            u.login,
            ls.id AS screenshot_id,
            ls.screenshot_url,
            lu.id AS url_id,
            lu.url
        FROM leaked l
        INNER JOIN users u ON u.uid = l.user_id
        LEFT JOIN leaked_screenshots ls ON ls.leaked_id = l.id
        LEFT JOIN leaked_urls lu ON lu.leaked_id = l.id
        WHERE l.id = ? AND l.publish = 1
    `
	rows, err := r.db.Query(query, leakedID)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var leak *leaked.Leaked
	for rows.Next() {
		var (
			id            int
			status        int
			blog          string
			createdAt     time.Time
			companyName   string
			description   string
			website       sql.NullString
			expires       sql.NullTime
			logoUrl       sql.NullString
			payout        float64
			payoutUnit    int
			userUID       int
			userLogin     string
			screenshotID  sql.NullInt64
			screenshotURL sql.NullString
			urlID         sql.NullInt64
			url           sql.NullString
			builder       int
			publish       int
		)

		if err := rows.Scan(
			&id, &status, &blog, &createdAt, &companyName, &description,
			&website, &expires, &logoUrl, &payout, &payoutUnit, &builder, &publish,
			&userUID, &userLogin, &screenshotID, &screenshotURL, &urlID, &url,
		); err != nil {
			return nil, fmt.Errorf("rows.Scan failed: %w", err)
		}

		// If it's the first row, initialize leak
		if leak == nil {
			leak = &leaked.Leaked{
				ID:          id,
				Status:      status,
				Blog:        blog,
				CreateAt:    createdAt,
				CompanyName: companyName,
				Description: description,
				Website:     website.String,
				LogoUrl:     logoUrl.String,
				Payout:      payout,
				PayoutUnit:  payoutUnit,
				Builder:     builder,
				Publish:     publish,
				User: user.User{
					ID:    int64(userUID),
					Login: userLogin,
				},
				Screenshots: []leaked.LeakedScreenshot{},
				Links:       []leaked.LeakedUrls{},
			}
			if expires.Valid {
				leak.Expires = &expires.Time
			}
		}

		// Append screenshot if valid
		if screenshotID.Valid && screenshotURL.Valid {
			found := false
			for _, scr := range leak.Screenshots {
				if scr.ID == int(screenshotID.Int64) {
					found = true
					break
				}
			}
			if !found {
				leak.Screenshots = append(leak.Screenshots, leaked.LeakedScreenshot{
					ID:       int(screenshotID.Int64),
					ImageURL: screenshotURL.String,
				})
			}
		}

		// Append link if valid
		if urlID.Valid && url.Valid {
			found := false
			for _, link := range leak.Links {
				if link.ID == int(urlID.Int64) {
					found = true
					break
				}
			}
			if !found {
				leak.Links = append(leak.Links, leaked.LeakedUrls{
					ID:  int(urlID.Int64),
					Url: url.String,
				})
			}
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// If not found (leak == nil), return nil + an error
	if leak == nil {
		return nil, sql.ErrNoRows
	}

	return leak, nil
}

func (r *LeakedRepository) GetCountNotAccepted() (int, error) {
	var count int

	err := r.db.QueryRow(`SELECT COUNT(*) FROM leaked WHERE is_accept = 0`).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// ----------------------------------------------------
// Create
// ----------------------------------------------------
// Inserts a new record into the 'leaked' table, then inserts screenshots/URLs if provided.
func (r *LeakedRepository) Create(leak *leaked.Leaked) (int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("failed to begin tx: %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		}
	}()

	var mysqlExpires interface{}
	if leak.ExpiresStr == "" {
		// Если значение отсутствует – передаём nil, чтобы в БД сохранился NULL
		mysqlExpires = nil
	} else {
		mysqlExpires, err = utility.FormatExpires(leak.ExpiresStr)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("failed to format expires: %w", err)
		}
	}

	// Добавили поле builder
	query := `
			INSERT INTO leaked (
					status, blog, company_name, description,
					website, expires, logo_url, payout, payout_unit, user_id, builder, is_accept
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	result, err := tx.Exec(query,
		leak.Status,
		leak.Blog,
		leak.CompanyName,
		leak.Description,
		leak.Website,
		mysqlExpires, // может быть nil
		leak.LogoUrl,
		leak.Payout,
		leak.PayoutUnit,
		leak.User.ID, // user_id
		leak.Builder, // <-- Новое поле
		leak.IsAccept,
	)
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to insert leaked: %w", err)
	}

	newID, err := result.LastInsertId()
	if err != nil {
		tx.Rollback()
		return 0, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	// Вставка скриншотов (не изменилась)
	for _, s := range leak.Screenshots {
		scrQuery := `
					INSERT INTO leaked_screenshots (leaked_id, screenshot_url)
					VALUES (?, ?)
			`
		if _, err := tx.Exec(scrQuery, newID, s.ImageURL); err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("failed to insert screenshot: %w", err)
		}
	}

	// Вставка ссылок (не изменилась)
	for _, link := range leak.Links {
		linkQuery := `
					INSERT INTO leaked_urls (leaked_id, url)
					VALUES (?, ?)
			`
		if _, err := tx.Exec(linkQuery, newID, link.Url); err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("failed to insert url: %w", err)
		}
	}

	// Завершаем транзакцию
	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("tx commit failed: %w", err)
	}

	return int(newID), nil
}

// ----------------------------------------------------
// Update
// ----------------------------------------------------
// Updates the main 'leaked' record. For simplicity, we remove all related
// screenshots and links, then re-insert. Adjust if you want partial updates instead.
func (r *LeakedRepository) Update(leak *leaked.Leaked) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		}
	}()

	var mysqlExpires interface{}
	if leak.ExpiresStr == "" {
		// Если значение отсутствует – передаём nil, чтобы в БД сохранился NULL
		mysqlExpires = nil
	} else {
		mysqlExpires, err = utility.FormatExpires(leak.ExpiresStr)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to format expires: %w", err)
		}
	}

	// Добавили поле builder
	query := `
			UPDATE leaked
			SET 
					status = ?,
					blog = ?,
					company_name = ?,
					description = ?,
					website = ?,
					expires = ?,
					logo_url = ?,
					payout = ?,
					payout_unit = ?,
					builder = ?,
					publish = ?,
					is_accept = ?
			WHERE id = ?
	`
	_, err = tx.Exec(query,
		leak.Status,
		leak.Blog,
		leak.CompanyName,
		leak.Description,
		leak.Website,
		mysqlExpires, // nil, если не задано
		leak.LogoUrl,
		leak.Payout,
		leak.PayoutUnit,
		leak.Builder, // <-- Новое поле
		leak.Publish,
		leak.IsAccept,
		leak.ID,
	)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update leaked: %w", err)
	}

	// Сначала удаляем старые скриншоты (не изменилось)
	delScrQ := `DELETE FROM leaked_screenshots WHERE leaked_id = ?`
	if _, err := tx.Exec(delScrQ, leak.ID); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete old screenshots: %w", err)
	}
	// Вставляем заново (не изменилось)
	for _, s := range leak.Screenshots {
		scrQ := `INSERT INTO leaked_screenshots (leaked_id, screenshot_url) VALUES (?, ?)`
		if _, err := tx.Exec(scrQ, leak.ID, s.ImageURL); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert new screenshot: %w", err)
		}
	}

	// То же самое для ссылок (не изменилось)
	delUrlsQ := `DELETE FROM leaked_urls WHERE leaked_id = ?`
	if _, err := tx.Exec(delUrlsQ, leak.ID); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete old urls: %w", err)
	}
	for _, link := range leak.Links {
		linkQ := `INSERT INTO leaked_urls (leaked_id, url) VALUES (?, ?)`
		if _, err := tx.Exec(linkQ, leak.ID, link.Url); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert new url: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("tx commit failed: %w", err)
	}

	return nil
}

// ----------------------------------------------------
// Delete
// ----------------------------------------------------
func (r *LeakedRepository) Delete(leakedID int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		}
	}()

	// First delete child records
	if _, err := tx.Exec(`DELETE FROM leaked_screenshots WHERE leaked_id = ?`, leakedID); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete from leaked_screenshots: %w", err)
	}
	if _, err := tx.Exec(`DELETE FROM leaked_urls WHERE leaked_id = ?`, leakedID); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete from leaked_urls: %w", err)
	}

	// Now delete from main table
	if _, err := tx.Exec(`DELETE FROM leaked WHERE id = ?`, leakedID); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete from leaked: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("tx commit failed: %w", err)
	}

	return nil
}

func (r *LeakedRepository) Accepted(leakedID int) error {
	_, err := r.db.Exec("UPDATE leaked SET is_accept = 1, publish = 1, status = 1 WHERE id = ?",
		leakedID)
	return err
}

func (r *LeakedRepository) Reject(leakedID int) error {
	_, err := r.db.Exec("UPDATE leaked SET is_accept = -1, publish = 0 WHERE id = ?",
		leakedID)
	return err
}
