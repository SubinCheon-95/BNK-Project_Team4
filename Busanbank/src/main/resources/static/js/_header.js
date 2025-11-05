// GNB 드롭다운 제어
document.querySelectorAll('.menu-item > a').forEach(menu => {
  menu.addEventListener('click', e => {
    e.preventDefault();

    const item = menu.parentElement;
    const isActive = item.classList.contains('active');

    // 모든 메뉴 닫기
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));

    // 클릭한 메뉴만 열기
    if (!isActive) item.classList.add('active');
  });
});

// --- DB 연동 예정 ---
async function loadSubmenuData() {
  try {
    const response = await fetch('/api/menu'); // ex) Spring Controller에서 메뉴 JSON 응답
    const menus = await response.json();

    menus.forEach(menu => {
      const target = document.querySelector(`.menu-item[data-menu="${menu.name}"] .submenu`);
      if (target) {
        target.innerHTML = menu.subcategories
          .map(sub => `<a href="#">${sub}</a>`)
          .join('');
      }
    });
  } catch (err) {
    console.error('메뉴 데이터를 불러오지 못했습니다:', err);
  }
}

loadSubmenuData();
