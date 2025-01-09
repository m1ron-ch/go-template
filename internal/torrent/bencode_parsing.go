package torrent

import (
	"bytes"
	"errors"
	"io"
	"strconv"
	"unicode"
)

type BValue interface{}

type BString string
type BInt int64
type BList []BValue
type BDict map[string]BValue

func decodeBencode(r *bytes.Reader) (BValue, error) {
	b, err := r.ReadByte()
	if err != nil {
		return nil, err
	}

	switch b {
	case 'i':
		// int
		var numStr []byte
		for {
			c, err := r.ReadByte()
			if err != nil {
				return nil, err
			}
			if c == 'e' {
				break
			}
			numStr = append(numStr, c)
		}
		// конвертируем в int64
		val, err := strconv.ParseInt(string(numStr), 10, 64)
		if err != nil {
			return nil, err
		}
		return BInt(val), nil
	case 'l':
		// list
		var list BList
		for {
			nextByte, err := r.ReadByte()
			if err != nil {
				return nil, err
			}
			if nextByte == 'e' {
				break
			}
			// Возвращаем указатель обратно, чтобы снова прочитать байт
			r.UnreadByte()
			elem, err := decodeBencode(r)
			if err != nil {
				return nil, err
			}
			list = append(list, elem)
		}
		return list, nil
	case 'd':
		// dict
		d := make(BDict)
		for {
			nextByte, err := r.ReadByte()
			if err != nil {
				return nil, err
			}
			if nextByte == 'e' {
				break
			}
			// Возвращаем указатель обратно, чтобы снова прочитать байт
			r.UnreadByte()
			keyVal, err := decodeBencode(r)
			if err != nil {
				return nil, err
			}
			key, ok := keyVal.(BString)
			if !ok {
				return nil, errors.New("dictionary key not a string")
			}
			val, err := decodeBencode(r)
			if err != nil {
				return nil, err
			}
			d[string(key)] = val
		}
		return d, nil
	default:
		if unicode.IsDigit(rune(b)) {
			// string
			lengthStr := []byte{b}
			for {
				c, err := r.ReadByte()
				if err != nil {
					return nil, err
				}
				if c == ':' {
					break
				}
				lengthStr = append(lengthStr, c)
			}
			length, err := strconv.Atoi(string(lengthStr))
			if err != nil {
				return nil, err
			}
			buf := make([]byte, length)
			_, err = io.ReadFull(r, buf)
			if err != nil {
				return nil, err
			}
			return BString(buf), nil
		}
		return nil, errors.New("invalid bencode")
	}
}
