package torrent

import (
	"bytes"
	"crypto/sha1"
	"fmt"
	"os"
	"strconv"
)

type TorrentInfo struct {
	Announce     string
	AnnounceList []string
	InfoHash     [20]byte
	PieceLength  int64
	Pieces       []byte
	Name         string
	Length       int64
}

func ParseTorrentFile(filename string) (*TorrentInfo, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	r := bytes.NewReader(data)
	val, err := decodeBencode(r)
	if err != nil {
		return nil, fmt.Errorf("failed to decode bencode: %w", err)
	}

	dict, ok := val.(BDict)
	if !ok {
		return nil, fmt.Errorf("torrent file: top-level is not a dictionary")
	}

	// Получение announce URL
	announceVal, ok := dict["announce"]
	if !ok {
		return nil, fmt.Errorf("'announce' key not found in torrent file")
	}
	announce, ok := announceVal.(BString)
	if !ok {
		return nil, fmt.Errorf("'announce' is not a string")
	}

	// Обработка announce-list (дополнительные трекеры)
	var announceList []string
	announceList = append(announceList, string(announce)) // Основной трекер

	if announceListVal, ok := dict["announce-list"]; ok {
		announceListRaw, ok := announceListVal.(BList)
		if ok {
			for _, trackerGroup := range announceListRaw {
				trackerUrls, ok := trackerGroup.(BList)
				if ok {
					for _, tracker := range trackerUrls {
						// Проверяем, является ли трекер строкой
						if trackerStr, ok := tracker.(BString); ok {
							announceList = append(announceList, string(trackerStr)) // Конвертируем в строку
							fmt.Println(announceList)
						} else {
							fmt.Printf("Skipping invalid tracker entry: %v\n", tracker)
						}
					}
				} else {
					fmt.Printf("Invalid tracker group: %v\n", trackerGroup)
				}
			}
		}
	}

	// Получение info
	infoVal, ok := dict["info"]
	if !ok {
		return nil, fmt.Errorf("'info' key not found in torrent file")
	}
	infoDict, ok := infoVal.(BDict)
	if !ok {
		return nil, fmt.Errorf("'info' is not a dictionary")
	}

	// Вычисление infoHash
	infoEncoded := encodeBencode(infoDict)
	infoHash := sha1.Sum(infoEncoded)

	// Получение piece length
	pieceLengthVal, ok := infoDict["piece length"]
	if !ok {
		return nil, fmt.Errorf("'piece length' key not found in info dictionary")
	}
	pieceLength, ok := pieceLengthVal.(BInt)
	if !ok {
		return nil, fmt.Errorf("'piece length' is not an integer")
	}

	// Получение pieces
	piecesVal, ok := infoDict["pieces"]
	if !ok {
		return nil, fmt.Errorf("'pieces' key not found in info dictionary")
	}
	pieces, ok := piecesVal.(BString)
	if !ok {
		return nil, fmt.Errorf("'pieces' is not a string")
	}

	// Получение имени торрента
	nameVal, ok := infoDict["name"]
	if !ok {
		return nil, fmt.Errorf("'name' key not found in info dictionary")
	}
	name, ok := nameVal.(BString)
	if !ok {
		return nil, fmt.Errorf("'name' is not a string")
	}

	// Проверяем однофайловый или многофайловый режим
	var totalLength int64

	if lengthVal, ok := infoDict["length"]; ok {
		// Однофайловый торрент
		length, ok := lengthVal.(BInt)
		if !ok {
			return nil, fmt.Errorf("'length' is not an integer")
		}
		totalLength = int64(length)
	} else if filesVal, ok := infoDict["files"]; ok {
		// Многофайловый торрент
		files, ok := filesVal.(BList)
		if !ok {
			return nil, fmt.Errorf("'files' is not a list")
		}

		// Суммируем длины всех файлов
		for _, file := range files {
			fileDict, ok := file.(BDict)
			if !ok {
				return nil, fmt.Errorf("file entry is not a dictionary")
			}

			lengthVal, ok := fileDict["length"]
			if !ok {
				return nil, fmt.Errorf("'length' key not found in file entry")
			}
			length, ok := lengthVal.(BInt)
			if !ok {
				return nil, fmt.Errorf("'length' in file entry is not an integer")
			}

			totalLength += int64(length)
		}
	} else {
		return nil, fmt.Errorf("'length' or 'files' key not found in info dictionary")
	}

	return &TorrentInfo{
		Announce:     string(announce),
		AnnounceList: announceList,
		InfoHash:     infoHash,
		PieceLength:  int64(pieceLength),
		Pieces:       []byte(pieces),
		Name:         string(name),
		Length:       totalLength,
	}, nil
}

// Простейший энкодер bencode для infoHash:
func encodeBencode(val BValue) []byte {
	var buf bytes.Buffer
	encodeBVal(&buf, val)
	return buf.Bytes()
}

func encodeBVal(buf *bytes.Buffer, val BValue) {
	switch v := val.(type) {
	case BInt:
		buf.WriteByte('i')
		buf.WriteString(strconv.FormatInt(int64(v), 10))
		buf.WriteByte('e')
	case BString:
		buf.WriteString(strconv.Itoa(len(v)))
		buf.WriteByte(':')
		buf.WriteString(string(v))
	case BList:
		buf.WriteByte('l')
		for _, e := range v {
			encodeBVal(buf, e)
		}
		buf.WriteByte('e')
	case BDict:
		buf.WriteByte('d')
		// Порядок ключей для infoHash не важен для расчёта хэша,
		// но по стандарту нужно лекс. сортировать. Для простоты оставим как есть.
		// В реальном клиенте надо сортировать ключи.
		for k, e := range v {
			encodeBVal(buf, BString(k))
			encodeBVal(buf, e)
		}
		buf.WriteByte('e')
	}
}
