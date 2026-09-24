// Ye script backend ke saare endpoints ko test karti hai
// Chalane ka tarika: node test-api.js (backend server pehle se chal raha hona chahiye)

const BASE_URL = "http://localhost:5000/api";
let token = "";
let projectId = "";
let taskId = "";

// Chhota helper function - result ko sundar tarike se print karega
function log(step, success, data) {
  const icon = success ? "✅" : "❌";
  console.log(`${icon} ${step}`);
  if (data) console.log("   →", JSON.stringify(data).slice(0, 150));
}

async function runTests() {
  console.log("🚀 TaskFlow AI Backend Testing Shuru...\n");

  // Random email har baar taaki "already registered" error na aaye
  const testEmail = `test${Date.now()}@example.com`;

  // 1. REGISTER
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email: testEmail, password: "test123" }),
    });
    const data = await res.json();
    if (data.success) {
      token = data.data.token;
      log("1. Register naya user", true, { name: data.data.name });
    } else {
      log("1. Register naya user", false, data);
    }
  } catch (err) {
    log("1. Register naya user", false, err.message);
  }

  // 2. LOGIN
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "test123" }),
    });
    const data = await res.json();
    log("2. Login karo", data.success, { name: data.data?.name });
  } catch (err) {
    log("2. Login karo", false, err.message);
  }

  // 3. CREATE PROJECT
  try {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Test Project", description: "Testing ke liye" }),
    });
    const data = await res.json();
    if (data.success) projectId = data.data._id;
    log("3. Naya project banao", data.success, { title: data.data?.title });
  } catch (err) {
    log("3. Naya project banao", false, err.message);
  }

  // 4. GET ALL PROJECTS
  try {
    const res = await fetch(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    log("4. Saare projects dekho", data.success, { count: data.data?.length });
  } catch (err) {
    log("4. Saare projects dekho", false, err.message);
  }

  // 5. CREATE TASK
  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: "Test Task", projectId, priority: "high" }),
    });
    const data = await res.json();
    if (data.success) taskId = data.data._id;
    log("5. Naya task banao", data.success, { title: data.data?.title });
  } catch (err) {
    log("5. Naya task banao", false, err.message);
  }

  // 6. UPDATE TASK STATUS
  try {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "in-progress" }),
    });
    const data = await res.json();
    log("6. Task status update karo", data.success, { status: data.data?.status });
  } catch (err) {
    log("6. Task status update karo", false, err.message);
  }

  // 7. DELETE TASK
  try {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    log("7. Task delete karo", data.success, data.message);
  } catch (err) {
    log("7. Task delete karo", false, err.message);
  }

  // 8. DELETE PROJECT
  try {
    const res = await fetch(`${BASE_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    log("8. Project delete karo", data.success, data.message);
  } catch (err) {
    log("8. Project delete karo", false, err.message);
  }

  // 9. TEST WITHOUT TOKEN (protected route check)
  try {
    const res = await fetch(`${BASE_URL}/projects`);
    const data = await res.json();
    log("9. Bina login access try karo (fail hona chahiye)", !data.success, data.error);
  } catch (err) {
    log("9. Bina login access try karo", false, err.message);
  }

  console.log("\n🎉 Testing complete!");
}

runTests();