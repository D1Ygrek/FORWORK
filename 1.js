async function tf(){
    let response = await fetch('http://127.0.0.1:8000/try/')
    console.log(await response.json())
}
tf()