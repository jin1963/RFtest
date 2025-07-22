let web3, account, contract, usdt;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    contract = new web3.eth.Contract(contractABI, contractAddress);
    usdt = new web3.eth.Contract(usdtABI, usdtAddress);

    document.getElementById("walletAddress").innerText = "✅ " + account;
    document.getElementById("refSection").style.display = "block";
    document.getElementById("refLink").value = window.location.origin + window.location.pathname + "?ref=" + account;
  } else {
    alert("กรุณาติดตั้ง MetaMask หรือ Bitget Wallet");
  }
}

async function copyRefLink() {
  const refInput = document.getElementById("refLink");
  refInput.select();
  document.execCommand("copy");
  alert("คัดลอกลิงก์แล้ว!");
}

async function registerReferrer() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");
  if (!ref || ref.toLowerCase() === account.toLowerCase()) {
    document.getElementById("status").innerText = "❌ ลิงก์ไม่ถูกต้องหรือไม่สามารถแนะนำตนเองได้";
    return;
  }
  try {
    await contract.methods.registerReferrer(ref).send({ from: account });
    document.getElementById("status").innerText = "✅ สมัคร referrer สำเร็จ";
  } catch (e) {
    document.getElementById("status").innerText = "❌ สมัครไม่สำเร็จ: " + e.message;
  }
}

async function purchase() {
  const amount = document.getElementById("usdtAmount").value;
  if (!amount || amount <= 0) {
    alert("กรุณาระบุจำนวน USDT");
    return;
  }

  const usdtAmount = web3.utils.toWei(amount, "mwei"); // USDT is 6 decimals

  try {
    document.getElementById("status").innerText = "⏳ Approving USDT...";
    await usdt.methods.approve(contractAddress, usdtAmount).send({ from: account });

    document.getElementById("status").innerText = "⏳ Purchasing KJC...";
    await contract.methods.buyWithReferral(usdtAmount).send({ from: account });

    document.getElementById("status").innerText = "✅ ซื้อ KJC สำเร็จ";
  } catch (e) {
    document.getElementById("status").innerText = "❌ เกิดข้อผิดพลาด: " + e.message;
  }
}
