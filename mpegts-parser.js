const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const FLAGS_MASK = 0x1fff;

class NoSyncBytePresent extends Error {
  constructor(index, offset) {
    super();
    this.index = index;
    this.offset = offset;
  }
}

class MpegParser {
  constructor(stream) {
    this.stream = stream;
  }

  parse() {
    return new Promise((resolve, reject) => {
      let packetIndex = 0;
      const pids = new Set();
      let buffer = Buffer.alloc(0);
      let firstPacketParsedOrDiscarded = false;

      this.stream.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.byteLength >= PACKET_SIZE) {
          if (buffer[0] !== SYNC_BYTE) {
            if (firstPacketParsedOrDiscarded) {
              reject(
                new NoSyncBytePresent(packetIndex, packetIndex * PACKET_SIZE)
              );
              return;
            }

            const nextSyncByteIndex = this.findNextSyncByteIndex(buffer);
            if (nextSyncByteIndex === -1) {
              buffer = Buffer.alloc(0);
              return;
            }

            buffer = buffer.subarray(nextSyncByteIndex);
          }

          const packet = buffer.subarray(0, PACKET_SIZE);
          buffer = buffer.subarray(PACKET_SIZE);

          // Extract PID (13 bits) and discard 3 MSB from 16 bits
          const pid = packet.readInt16BE(1) & FLAGS_MASK;
          pids.add(pid);

          packetIndex += 1;
          firstPacketParsedOrDiscarded = true;
        }
      });

      this.stream.on("error", (err) => reject(err));
      this.stream.on("end", () => resolve(Array.from(pids)));
    });
  }

  findNextSyncByteIndex(buffer) {
    let nextSyncByteIndex = buffer.indexOf(SYNC_BYTE, 1);
    while (
      nextSyncByteIndex !== -1 &&
      nextSyncByteIndex + PACKET_SIZE < buffer.byteLength
    ) {
      if (buffer[nextSyncByteIndex + PACKET_SIZE] === SYNC_BYTE) {
        break;
      }
      nextSyncByteIndex = buffer.indexOf(SYNC_BYTE, nextSyncByteIndex + 1);
    }

    return nextSyncByteIndex;
  }
}

const parser = new MpegParser(process.stdin);
parser
  .parse()
  .then((pids) =>
    pids
      .sort((a, b) => a - b)
      .map((pid) => "0x" + pid.toString(16))
      .forEach((pid) => console.log(pid))
  )
  .catch((err) => {
    if (err instanceof NoSyncBytePresent) {
      console.log(
        `Error: No sync byte present in packet ${err.index}, offset ${err.offset}`
      );
      process.exit(1);
    }
    throw err;
  });
