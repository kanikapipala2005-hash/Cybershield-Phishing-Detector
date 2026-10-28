const analyzeUrl = (url: string) => {
  const u = url.toLowerCase();
  let score = 0;
  let issues: string[] = [];

  // 5-Layer Engine
  const hasHttps = u.startsWith("https://");
  const hasIp = /\d+\.\d+\.\d+\.\d+/.test(u);
  const hasAt = u.includes("@");
  const dotCount = (u.match(/\./g) || []).length;
  const hyphenCount = (u.match(/-/g) || []).length;
  const badKeywords = ["login", "sbi", "yono", "reward", "points", "claim", "verify", "kyc", "bank"];

  let foundKeywords = badKeywords.filter(k => u.includes(k));

  // Layer 1: HTTPS
  if (!hasHttps) score += 20;

  // Layer 2: IP
  if (hasIp) {
    score = 95; // DIRECT CRITICAL
    issues.push("IP Address");
  }

  // Layer 3: @ Trick
  if (hasAt) {
    score = Math.max(score, 90); // DIRECT DANGEROUS
    issues.push("Contains @");
  }

  // Layer 4: Length + Dots
  if (dotCount >= 4 || hyphenCount >= 3 || u.length > 75) {
    score += 40;
    if (dotCount >= 4) issues.push(`${dotCount} dots`);
  }

  // Layer 5: Bad Keywords - YAHI TUMHARA BUG HAI
  if (foundKeywords.length > 0) {
    // SBI + YONO + REWARD + LOGIN = 100% fraud
    if (u.includes("sbi") && (u.includes("yono") || u.includes("reward"))) {
      score = Math.max(score, 95);
    } else if (foundKeywords.length >= 2) {
      score += foundKeywords.length * 25; // 2 keywords = 50 score
    } else {
      score += 20;
    }
    issues.push(`Keywords: ${foundKeywords.join(", ")}`);
  }

  if (score > 100) score = 98;
  if (score < 5) score = 5;

  let status = "SAFE";
  if (score >= 80) status = "DANGEROUS";
  else if (score >= 40) status = "SUSPICIOUS";
  
  // Result fix for UI
  if(status === "DANGEROUS" || status === "CRITICAL") status = "UNSAFE"; // if your UI expects UNSAFE

  return { score, status, foundKeywords, hasHttps, hasIp, hasAt, dotCount };
};
