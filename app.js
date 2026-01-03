// 🔹 Supabase credentials
const SUPABASE_URL = "https://eyyoigiytzhbtcwqvooa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5eW9pZ2l5dHpoYnRjd3F2b29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDE0OTUsImV4cCI6MjA3MDUxNzQ5NX0.2LNSR60X9QXh2oih_bmnP31iKo5pV82-0cPa06J2L8k";

// 🔹 Create Supabase client
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log(client);

// =====signup work=========

const password = document.getElementById("password");
const email = document.getElementById("email");
const username = document.getElementById("name");
const profileImg = document.getElementById("profileImg");
const btn = document.getElementById("btn");

btn && btn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Empty fields
    if (userValue === "" || emailValue === "" || passwordValue === "" || !profileImg.files[0]) {
        Swal.fire({
            icon: "warning",
            title: "Oops!",
            text: "Please fill all fields"
        });
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Email",
            text: "Please enter a valid email address"
        });
        return;
    }

    // Password validation
    if (passwordValue.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Weak Password",
            text: "Password must be at least 6 characters"
        });
        return;
    }

    // Signup
    const { data, error } = await client.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
            data: {
                username: userValue,
                // role: "user"
            }
        }
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Signup Failed",
            text: error.message
        });
        return;
    }

    // Success alert
    Swal.fire({
        icon: "success",
        title: "Account Created 🎉",
        text: "Your account has been created successfully",
        timer: 2000,
        showConfirmButton: false,
    }).then(() => {
 window.location.href = "login.html";
    });

    // ===== Image Upload =====
    const profileImgFile = profileImg.files[0];
    const fileName = `${Date.now()}-${profileImgFile.name}`;

    const { error: uploadError } = await client.storage
        .from("hackathon-profile")
        .upload(fileName, profileImgFile, { upsert: true });

    if (uploadError) {
        Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: "Profile image upload failed"
        });
        return;
    }

    // ===== Get Public URL =====
    const { data: imgData } = client.storage
        .from("hackathon-profile")
        .getPublicUrl(fileName);

    const profileImageUrl = imgData.publicUrl;

    // ===== Insert User Data =====
    const { error: insertError } = await client
        .from("all-users-data")
        .insert({
            name: data.user.user_metadata.username,
            email: data.user.email,
            // role: data.user.user_metadata.role,
            user_id: data.user.id,
            profile_img: profileImageUrl,
        });

});
// ============= login ============

const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");

loginBtn && loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // ❌ empty check
    if (loginEmail.value.trim() === "" || loginPass.value.trim() === "") {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please fill all fields"
        });
        return;
    }

    // ❌ password length check
    if (loginPass.value.length < 6) {
        Swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Password must be at least 6 characters"
        });
        return;
    }

    // ⏳ loading
    Swal.fire({
        title: "Logging in...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const { data, error } = await client.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPass.value,
    });

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: error.message
        });
        return;
    }

    // let userId = data.user.id;

    // const { data: roleData, error: roleError } = await client
    //     .from("all-users-data")
    //     .select("role")
    //     .eq("user_id", userId)
    //     .single();

    // if (roleError) {
    //     Swal.fire({
    //         icon: "error",
    //         title: "Error",
    //         text: "Role fetch nahi ho raha"
    //     });
    //     return;
    // }

    // ✅ success + redirect
    Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: "Redirecting...",
        timer: 1500,
        showConfirmButton: false
    });

    // setTimeout(() => {
    //     if (roleData.role === "admin") {
    //         window.location.href = "dashboard.html";
    //     } else {
    //         window.location.href = "index.html";
    //     }
    // }, 1500);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn &&
  logoutBtn.addEventListener("click", async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    // 🔹 Supabase logout
    const { error } = await client.auth.signOut();

    if (error) {
      Swal.fire("Error", error.message, "error");
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Logged out",
      text: "You have been logged out successfully",
      timer: 1500,
      showConfirmButton: false,
      didClose: () => {
        window.location.href = "login.html";
      },
    });
  });

  
const mobile = document.getElementById("moblog");

mobile &&
  mobile.addEventListener("click", async () => {
     const { error } = await client.auth.signOut();
      window.location.href = "login.html";
    
    });

// ============= End ============
