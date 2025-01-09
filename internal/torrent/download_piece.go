package torrent

import (
	"encoding/binary"
	"errors"
	"io"
	"net"
)

func DownloadPiece(conn net.Conn, t *TorrentInfo, pieceIndex int) ([]byte, error) {
	// Простой запрос одного куска (piece):
	// После handshake идет обмен сообщениями: interested, unchoke и т.д.
	// Упрощенно: Отправим interested и подождём unchoke.

	// interested
	// length prefix:4 bytes (1), message id:1 byte (2)
	interestedMsg := []byte{0, 0, 0, 1, 2}
	conn.Write(interestedMsg)

	// Ждём сообщений от пира
	// Например, unchoke (id=1)
	if err := waitForUnchoke(conn); err != nil {
		return nil, err
	}

	// Рассчёт размера куска:
	pieceLen := int64(len(t.Pieces) / 20 * int(t.PieceLength)) // грубо, но лучше вычислить точно.
	// На самом деле:
	// Общее число кусков = len(t.Pieces)/20
	totalPieces := len(t.Pieces) / 20
	// Последний кусок может быть короче:
	if pieceIndex == totalPieces-1 {
		lastPieceSize := t.Length - int64(t.PieceLength)*int64(totalPieces-1)
		pieceLen = lastPieceSize
	} else {
		pieceLen = t.PieceLength
	}

	// Запрашиваем блоки по 16KB
	blockSize := int64(16384)
	downloaded := make([]byte, 0, pieceLen)
	var offset int64
	for offset < pieceLen {
		size := blockSize
		if offset+size > pieceLen {
			size = pieceLen - offset
		}
		// request msg:
		// <len=13><id=6><index><begin><length>
		req := make([]byte, 17)
		// length=13
		binary.BigEndian.PutUint32(req[0:4], 13)
		req[4] = 6
		binary.BigEndian.PutUint32(req[5:9], uint32(pieceIndex))
		binary.BigEndian.PutUint32(req[9:13], uint32(offset))
		binary.BigEndian.PutUint32(req[13:17], uint32(size))
		conn.Write(req)

		// Ждём piece msg:
		// piece msg: <len+9><id=7><index><begin><block>
		// len = 9 + размер блока
		expectedLen := 9 + size
		pieceResp := make([]byte, 4) // first 4 for length
		if _, err := io.ReadFull(conn, pieceResp); err != nil {
			return nil, err
		}
		respLen := binary.BigEndian.Uint32(pieceResp)
		if respLen != uint32(expectedLen) {
			return nil, errors.New("unexpected piece length")
		}

		msg := make([]byte, respLen)
		if _, err := io.ReadFull(conn, msg); err != nil {
			return nil, err
		}
		if msg[0] != 7 {
			return nil, errors.New("expected piece message")
		}
		gotIndex := binary.BigEndian.Uint32(msg[1:5])
		gotBegin := binary.BigEndian.Uint32(msg[5:9])
		if int(gotIndex) != pieceIndex || int64(gotBegin) != offset {
			return nil, errors.New("piece data mismatch")
		}
		block := msg[9:]
		downloaded = append(downloaded, block...)
		offset += int64(len(block))
	}

	return downloaded, nil
}

func waitForUnchoke(conn net.Conn) error {
	// Ждём сообщений от пира, пока не придет unchoke (id=1)
	// Сообщения: <length><id>...
	// keep-alive: length=0
	// unchoke: length=1, id=1
	for {
		lengthBuf := make([]byte, 4)
		if _, err := io.ReadFull(conn, lengthBuf); err != nil {
			return err
		}
		length := binary.BigEndian.Uint32(lengthBuf)
		if length == 0 {
			// keep-alive
			continue
		}
		msg := make([]byte, length)
		if _, err := io.ReadFull(conn, msg); err != nil {
			return err
		}
		if msg[0] == 1 {
			// unchoke
			return nil
		}
		// Игнорируем другие сообщения
	}
}
