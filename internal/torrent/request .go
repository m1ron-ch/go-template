package torrent

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"strconv"
)

func RequestPeers(t *TorrentInfo) ([]string, error) {
	parsed, err := url.Parse(t.Announce)
	if err != nil {
		return nil, err
	}

	// Генерируем peer_id
	peerID := GeneratePeerID()
	values := parsed.Query()
	values.Set("info_hash", string(t.InfoHash[:]))
	values.Set("peer_id", peerID)
	values.Set("port", "6881")
	values.Set("uploaded", "0")
	values.Set("downloaded", "0")
	values.Set("left", strconv.FormatInt(t.Length, 10))
	values.Set("event", "started")

	parsed.RawQuery = ""
	reqURL := parsed.String() + "?" + encodeTrackerParams(values, t.InfoHash[:], peerID)

	// Выполняем GET запрос
	resp, err := http.Get(reqURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	r := bytes.NewReader(body)
	val, err := decodeBencode(r)
	if err != nil {
		return nil, err
	}

	respDict, ok := val.(BDict)
	if !ok {
		return nil, errors.New("tracker response not dict")
	}

	// Пиры могут быть либо списком словарей, либо бинарным списком
	peersVal, ok := respDict["peers"]
	if !ok {
		return nil, errors.New("no peers in response")
	}

	var peers []string
	switch p := peersVal.(type) {
	case BList:
		// Каждый элемент - dict со строками ip и port
		for _, pv := range p {
			pd, ok := pv.(BDict)
			if !ok {
				continue
			}
			ipStr, _ := pd["ip"].(BString)
			portNum, _ := pd["port"].(BInt)
			peers = append(peers, fmt.Sprintf("%s:%d", ipStr, portNum))
		}
	case BString:
		// Компрессированный список пиров, каждые 6 байт: 4 байта IP, 2 байта порт
		b := []byte(p)
		if len(b)%6 != 0 {
			return nil, errors.New("invalid peers binary length")
		}
		for i := 0; i < len(b); i += 6 {
			ip := net.IPv4(b[i], b[i+1], b[i+2], b[i+3]).String()
			port := binary.BigEndian.Uint16(b[i+4 : i+6])
			peers = append(peers, fmt.Sprintf("%s:%d", ip, port))
		}
	default:
		return nil, errors.New("unknown peers format")
	}

	return peers, nil
}

func encodeTrackerParams(values url.Values, infoHash []byte, peerID string) string {
	// info_hash и peer_id нужно закодировать отдельно, т.к. они бинарные
	q := make(url.Values)
	q.Set("info_hash", encodeBinary(infoHash))
	q.Set("peer_id", encodeBinary([]byte(peerID)))
	q.Set("port", values.Get("port"))
	q.Set("uploaded", values.Get("uploaded"))
	q.Set("downloaded", values.Get("downloaded"))
	q.Set("left", values.Get("left"))
	q.Set("event", "started")
	return q.Encode()
}

func encodeBinary(data []byte) string {
	// Правильная URL-кодировка для info_hash/peer_id
	res := make([]byte, 0, len(data)*3)
	for _, c := range data {
		// Согласно спецификации, каждый байт, кроме букв и цифр, кодируется как %XX
		// Даже многие буквы тоже лучше закодировать.
		// Проще всегда кодировать, кроме ASCII-букв/цифр.
		if (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '.' || c == '-' || c == '_' || c == '~' {
			res = append(res, c)
		} else {
			res = append(res, '%')
			hex := []byte(fmt.Sprintf("%02X", c))
			res = append(res, hex...)
		}
	}
	return string(res)
}

func GeneratePeerID() string {
	// Простой генератор peer_id
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	peerID := "-GO0001-"
	for i := 0; i < 12; i++ {
		peerID += string(charset[rand.Intn(len(charset))])
	}
	return peerID
}
