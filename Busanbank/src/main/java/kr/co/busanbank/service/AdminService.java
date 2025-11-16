package kr.co.busanbank.service;

import kr.co.busanbank.dto.AdminDTO;
import kr.co.busanbank.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 작성자: 진원
 * 작성일: 2025-11-16
 * 설명: 관리자 계정 관리 서비스
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class AdminService {

    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 관리자 목록 조회 (페이징)
     */
    public List<AdminDTO> getAdminList(int page, int size, String searchKeyword) {
        int offset = (page - 1) * size;
        return adminMapper.selectAdminList(offset, size, searchKeyword);
    }

    /**
     * 관리자 전체 개수
     */
    public int getTotalCount(String searchKeyword) {
        return adminMapper.countAdmins(searchKeyword);
    }

    /**
     * 관리자 ID로 조회
     */
    public AdminDTO getAdminById(int adminId) {
        return adminMapper.selectAdminById(adminId);
    }

    /**
     * 관리자 추가
     */
    public boolean createAdmin(AdminDTO adminDTO) {
        try {
            // 비밀번호 암호화
            String encodedPassword = passwordEncoder.encode(adminDTO.getPassword());
            adminDTO.setPassword(encodedPassword);

            int result = adminMapper.insertAdmin(adminDTO);
            return result > 0;
        } catch (Exception e) {
            log.error("관리자 추가 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 관리자 수정
     */
    public boolean updateAdmin(AdminDTO adminDTO) {
        try {
            // 비밀번호가 있으면 암호화
            if (adminDTO.getPassword() != null && !adminDTO.getPassword().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(adminDTO.getPassword());
                adminDTO.setPassword(encodedPassword);
            }

            int result = adminMapper.updateAdmin(adminDTO);
            return result > 0;
        } catch (Exception e) {
            log.error("관리자 수정 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 관리자 삭제 (soft delete)
     */
    public boolean deleteAdmin(int adminId) {
        try {
            int result = adminMapper.deleteAdmin(adminId);
            return result > 0;
        } catch (Exception e) {
            log.error("관리자 삭제 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 로그인 ID 중복 체크
     */
    public boolean isLoginIdDuplicate(String loginId) {
        int count = adminMapper.countByLoginId(loginId);
        return count > 0;
    }
}
