/**
 * 작성자: 진원
 * 작성일: 2025-11-16
 * 설명: 관리자 계정 관리 JavaScript
 */

let currentPage = 1;
const pageSize = 10;
let searchKeyword = '';

// 페이지 로딩 시 실행
document.addEventListener('DOMContentLoaded', () => {
    loadAdminList();
    initializeEventListeners();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 검색 버튼
    const searchBtn = document.querySelector('#account .search_btn');
    const searchInput = document.querySelector('#account .search_input');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchKeyword = searchInput.value.trim();
            currentPage = 1;
            loadAdminList();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchKeyword = searchInput.value.trim();
                currentPage = 1;
                loadAdminList();
            }
        });
    }

    // 추가 버튼
    const addBtn = document.querySelector('#addAdminBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddModal);
    }

    // 모달 닫기 버튼
    const closeBtn = document.querySelector('.admin-modal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // 모달 저장 버튼
    const saveBtn = document.querySelector('#saveAdminBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAdmin);
    }

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        const modal = document.querySelector('#adminModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // 로그인 ID 중복 체크
    const loginIdInput = document.querySelector('#adminLoginId');
    if (loginIdInput) {
        loginIdInput.addEventListener('blur', checkLoginIdDuplicate);
    }
}

// 관리자 목록 조회
async function loadAdminList() {
    try {
        const response = await fetch(`/busanbank/admin/setting/admins?page=${currentPage}&size=${pageSize}&searchKeyword=${searchKeyword}`);
        const data = await response.json();

        if (data.success) {
            renderAdminTable(data.data);
            renderPagination(data.totalPages, data.currentPage);
        } else {
            alert('관리자 목록 조회 실패: ' + data.message);
        }
    } catch (error) {
        console.error('관리자 목록 조회 오류:', error);
        alert('관리자 목록 조회 중 오류가 발생했습니다.');
    }
}

// 관리자 테이블 렌더링
function renderAdminTable(adminList) {
    const tbody = document.querySelector('#adminTableBody');
    if (!tbody) return;

    if (!adminList || adminList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">등록된 관리자가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = adminList.map((admin, index) => {
        const rowClass = index === adminList.length - 1 ? 'content_tr_last' : 'content_tr';
        const startStyle = index === adminList.length - 1 ? 'style="border-radius: 0 0 0 5px;"' : '';
        const endStyle = index === adminList.length - 1 ? 'style="border-radius: 0 0 5px 0;"' : '';

        return `
            <tr class="${rowClass}">
                <td ${startStyle}>${(currentPage - 1) * pageSize + index + 1}</td>
                <td>${admin.name || '-'}</td>
                <td>${admin.loginId}</td>
                <td>${admin.email || '-'}</td>
                <td>${admin.role || '-'}</td>
                <td>${admin.createdAt ? admin.createdAt.substring(0, 10) : '-'}</td>
                <td ${endStyle}>
                    <button class="productList_btn" onclick="openEditModal(${admin.adminId})">
                        <img src="/busanbank/images/admin/free-icon-pencil-7175371.png" alt="수정 버튼" style="width: 100%;height: 100%;object-fit: contain;">
                    </button>
                    <button class="productList_btn" onclick="deleteAdmin(${admin.adminId}, '${admin.loginId}')">
                        <img src="/busanbank/images/admin/cross-mark.png" alt="삭제 버튼" style="width: 100%;height: 100%;object-fit: contain;">
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 페이징 렌더링
function renderPagination(totalPages, currentPageNum) {
    const paginationUl = document.querySelector('#account .pagenation');
    if (!paginationUl) return;

    let html = '';

    // 이전 버튼
    if (currentPageNum > 1) {
        html += `<li><a href="#" class="page2" onclick="changePage(${currentPageNum - 1}); return false;"><span class="prev"></span></a></li>`;
    }

    // 페이지 번호 (현재 페이지 기준 ±2 페이지)
    const startPage = Math.max(1, currentPageNum - 2);
    const endPage = Math.min(totalPages, currentPageNum + 2);

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPageNum ? 'active' : '';
        html += `<li><a href="#" class="page1 ${activeClass}" onclick="changePage(${i}); return false;">${i}</a></li>`;
    }

    // 다음 버튼
    if (currentPageNum < totalPages) {
        html += `<li><a href="#" class="page2" onclick="changePage(${currentPageNum + 1}); return false;"><span class="next"></span></a></li>`;
    }

    paginationUl.innerHTML = html;
}

// 페이지 변경
function changePage(page) {
    currentPage = page;
    loadAdminList();
}

// 추가 모달 열기
function openAddModal() {
    document.querySelector('#modalTitle').textContent = '관리자 추가';
    document.querySelector('#adminForm').reset();
    document.querySelector('#adminId').value = '';
    document.querySelector('#passwordGroup').style.display = 'block';
    document.querySelector('#adminPassword').required = true;
    document.querySelector('#adminModal').style.display = 'block';
}

// 수정 모달 열기
async function openEditModal(adminId) {
    try {
        const response = await fetch(`/busanbank/admin/setting/admins/${adminId}`);
        const data = await response.json();

        if (data.success) {
            const admin = data.data;
            document.querySelector('#modalTitle').textContent = '관리자 수정';
            document.querySelector('#adminId').value = admin.adminId;
            document.querySelector('#adminLoginId').value = admin.loginId;
            document.querySelector('#adminName').value = admin.name || '';
            document.querySelector('#adminEmail').value = admin.email || '';
            document.querySelector('#adminRole').value = admin.role || '';
            document.querySelector('#passwordGroup').style.display = 'none';
            document.querySelector('#adminPassword').required = false;
            document.querySelector('#adminModal').style.display = 'block';
        } else {
            alert('관리자 정보 조회 실패: ' + data.message);
        }
    } catch (error) {
        console.error('관리자 조회 오류:', error);
        alert('관리자 정보 조회 중 오류가 발생했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    document.querySelector('#adminModal').style.display = 'none';
    document.querySelector('#adminForm').reset();
}

// 관리자 저장 (추가/수정)
async function saveAdmin() {
    const adminId = document.querySelector('#adminId').value;
    const loginId = document.querySelector('#adminLoginId').value.trim();
    const password = document.querySelector('#adminPassword').value;
    const name = document.querySelector('#adminName').value.trim();
    const email = document.querySelector('#adminEmail').value.trim();
    const role = document.querySelector('#adminRole').value;

    // 유효성 검사
    if (!loginId) {
        alert('로그인 ID를 입력해주세요.');
        return;
    }

    if (!adminId && !password) {
        alert('비밀번호를 입력해주세요.');
        return;
    }

    if (!name) {
        alert('이름을 입력해주세요.');
        return;
    }

    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    const adminData = {
        loginId: loginId,
        name: name,
        email: email,
        role: role
    };

    if (password) {
        adminData.password = password;
    }

    try {
        let response;
        if (adminId) {
            // 수정
            adminData.adminId = parseInt(adminId);
            response = await fetch(`/busanbank/admin/setting/admins/${adminId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adminData)
            });
        } else {
            // 추가
            response = await fetch('/busanbank/admin/setting/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adminData)
            });
        }

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            closeModal();
            loadAdminList();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('관리자 저장 오류:', error);
        alert('관리자 저장 중 오류가 발생했습니다.');
    }
}

// 관리자 삭제
async function deleteAdmin(adminId, loginId) {
    if (!confirm(`관리자 '${loginId}'를 삭제하시겠습니까?`)) {
        return;
    }

    try {
        const response = await fetch(`/busanbank/admin/setting/admins/${adminId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            loadAdminList();
        } else {
            alert('삭제 실패: ' + data.message);
        }
    } catch (error) {
        console.error('관리자 삭제 오류:', error);
        alert('관리자 삭제 중 오류가 발생했습니다.');
    }
}

// 로그인 ID 중복 체크
async function checkLoginIdDuplicate() {
    const adminId = document.querySelector('#adminId').value;
    const loginId = document.querySelector('#adminLoginId').value.trim();

    // 수정 모드거나 값이 없으면 체크하지 않음
    if (adminId || !loginId) {
        return;
    }

    try {
        const response = await fetch(`/busanbank/admin/setting/admins/check-loginid?loginId=${loginId}`);
        const data = await response.json();

        if (data.success && data.isDuplicate) {
            alert('이미 사용 중인 로그인 ID입니다.');
            document.querySelector('#adminLoginId').value = '';
            document.querySelector('#adminLoginId').focus();
        }
    } catch (error) {
        console.error('중복 체크 오류:', error);
    }
}
