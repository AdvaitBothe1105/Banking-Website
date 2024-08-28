const assets = document.getElementById('assets-btn');
const liab = document.getElementById('liab-btn')
const asset_txt  = document.getElementById('asset-txt')
const liab_txt  = document.getElementById('liab-txt')


assets.addEventListener('click', () => {
    asset_txt.style.display = "block";
})

liab.addEventListener('click', () => {
    liab_txt.style.display = "block";
})