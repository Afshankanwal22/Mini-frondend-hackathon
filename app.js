

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
 window.location.href = "index.html";
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
        .from("post-images")
        .getPublicUrl(fileName);

    const profileImageUrl = imgData.publicUrl;

    // ===== Insert User Data =====
    const { error: insertError } = await client
        .from("all-users-data")
        .insert({
            name: data.user.user_metadata.username,
            email: data.user.email,
            user_id: data.user.id,
            profile_img: profileImageUrl,
        });
        console.log(data);
        

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

    
    // ✅ success + redirect
    Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: "Redirecting...",
        timer: 1500,
        showConfirmButton: false
    });
    setTimeout(() => {
        window.location.href = "post.html";
    }, 1500);
});

