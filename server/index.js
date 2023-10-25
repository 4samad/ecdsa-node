const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");


app.use(cors());
app.use(express.json());

const balances = {
  "0349f44b0d40fa4d500b9800032d1229ce77a0faa062bda3a82b8a6afb18040c5a": 100,
  "03a4f16e3f8625b124ea3b39a7efd8cf1ad508d999ace0b23b2581b96032b556d5": 50,
  "02e88ef40bc206e7306759d21bb0795b5e689a3e2bb5f1b452bf19208f6454fcdb": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  const { message, signature } = req.body;
  const { recipient, amount } = message;

  // Get public key and sender
  const messageHash = keccak256(utf8ToBytes(JSON.stringify(message)))
  const sender = toHex(secp.recoverPublicKey(messageHash, signature));

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
