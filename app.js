// shared helpers used by every page

// ---------- login (kept in sessionStorage, so it ends when the tab closes) ----------
// demo accounts: change or add your own here
const USERS = [
    { user:"donor",     pass:"donor123",   role:"donor",     name:"Green Mess" },
    { user:"ngo",       pass:"ngo123",     role:"ngo",       name:"Hope NGO"   },
    { user:"admin",     pass:"admin123",   role:"admin",     name:"Admin"      },
    { user:"inspector", pass:"inspect123", role:"inspector", name:"Inspector"  }
];

// the page each role starts on
function homeFor(role){
    if(role == "donor"){ return "donor.html"; }
    if(role == "admin"){ return "admin.html"; }
    if(role == "inspector"){ return "inspector.html"; }
    return "home.html";
}

function currentUser(){
    let u = sessionStorage.getItem("USER");
    if(u == null){ return null; }
    return JSON.parse(u);
}

// call at the top of a protected page
function requireRole(role){
    let u = currentUser();
    if(u == null){
        window.location.href = "login.html";
        return false;
    }
    if(u.role != role){
        // logged in, but this page is for the other role
        window.location.href = homeFor(u.role);
        return false;
    }
    return true;
}

function logout(){
    sessionStorage.removeItem("USER");
    sessionStorage.removeItem("fid");
    window.location.href = "login.html";
}

// draws the header; links depend on who is logged in
function showNav(){
    let u = currentUser();
    let links = "";
    if(u != null && u.role == "ngo"){
        links += '<a href="home.html">Home</a><a href="myreg.html">My Claims</a>';
    }
    if(u != null && u.role == "donor"){
        links += '<a href="donor.html">Donate Food</a>';
    }
    if(u != null && u.role == "admin"){
        links += '<a href="admin.html">Dashboard</a>';
    }
    if(u != null && u.role == "inspector"){
        links += '<a href="inspector.html">Inspections</a>';
    }
    links += '<a href="abt.html">About us</a><a href="cntct.html">Contact us</a>';
    if(u != null){
        links += '<span class="who">'+esc(u.name)+'</span><a href="#" onclick="logout()">Logout</a>';
    }else{
        links += '<a href="login.html">Login</a>';
    }
    document.getElementById("hdr").innerHTML =
        '<div class="brand">FoodLink</div><div class="links">'+links+'</div>';
}

// ---------- helpers ----------
// stop typed text from breaking the page
function esc(t){
    return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// show a date/time in a readable way
function fmt(d){
    return new Date(d).toLocaleString();
}

function saveFood(list){
    localStorage.setItem("FOOD", JSON.stringify(list));
}

// get all food listings (creates 3 sample ones the first time)
function loadFood(){
    if(localStorage.getItem("FOOD")==null){
        let h=3600000;
        saveFood([
            { id:1, name:"Veg Biryani", servings:20, veg:true,  nature:"Freshly cooked", expires:new Date(Date.now()+3*h).toISOString(), address:"Hostel Mess, Block A", donor:"Hostel Mess", phone:"9876543210", status:"available", approval:"approved" },
            { id:2, name:"Bread Packets", servings:40, veg:true, nature:"Packaged",       expires:new Date(Date.now()+8*h).toISOString(), address:"Canteen, Main Gate",  donor:"Canteen",     phone:"9876543211", status:"available", approval:"approved" },
            { id:3, name:"Chicken Curry", servings:15, veg:false, nature:"Freshly cooked", expires:new Date(Date.now()+2*h).toISOString(), address:"Fest Ground, Stall 4", donor:"Fest Team",   phone:"9876543212", status:"available", approval:"pending" }
        ]);
    }
    let list=JSON.parse(localStorage.getItem("FOOD"));

    // anything past its expiry time becomes "expired"
    let changed=false;
    for(let i=0;i<list.length;i++){
        if(list[i].approval == null){ list[i].approval = "pending"; changed=true; }
        if(list[i].status=="available" && new Date(list[i].expires).getTime()<Date.now()){
            list[i].status="expired";
            changed=true;
        }
    }
    if(changed){ saveFood(list); }
    return list;
}
