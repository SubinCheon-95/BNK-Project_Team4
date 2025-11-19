package kr.co.busanbank.service;

import kr.co.busanbank.dto.ProductDTO;
import kr.co.busanbank.dto.ProductJoinRequestDTO;
import kr.co.busanbank.dto.UserProductDTO;
import kr.co.busanbank.mapper.UserProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 *
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class ProductJoinService {

    private final ProductService productService;
    private final UserProductMapper userProductMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * 금리 계산 (기본 금리 + 우대 금리)
     */
    public BigDecimal calculateApplyRate(int productNo) {
        ProductDTO product = productService.getProductById(productNo);
        // 실제로는 우대 조건에 따라 계산해야 하지만, 여기서는 만기우대금리를 사용
        return product.getMaturityRate();
    }

    /**
     * 예상 이자 계산
     * @param principalAmount 원금 (예금) 또는 월 납입액 (적금)
     * @param applyRate 적용 금리 (%)
     * @param contractTerm 계약 기간 (개월)
     * @param productType 상품 유형 (01: 예금, 02: 적금)
     * @return 예상 이자
     */
    public BigDecimal calculateExpectedInterest(
            BigDecimal principalAmount,
            BigDecimal applyRate,
            int contractTerm,
            String productType) {

        BigDecimal interest = BigDecimal.ZERO;

        if ("01".equals(productType)) {
            // 예금: 원금 × 금리 × (기간/12)
            interest = principalAmount
                    .multiply(applyRate.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP))
                    .multiply(BigDecimal.valueOf(contractTerm).divide(BigDecimal.valueOf(12), 6, RoundingMode.HALF_UP));
        } else if ("02".equals(productType)) {
            // 적금: 월 납입액 × 기간 × (기간+1) / 24 × 금리
            BigDecimal totalMonths = BigDecimal.valueOf(contractTerm);
            BigDecimal totalDeposits = principalAmount.multiply(totalMonths);

            interest = totalDeposits
                    .multiply(totalMonths.add(BigDecimal.ONE))
                    .divide(BigDecimal.valueOf(24), 6, RoundingMode.HALF_UP)
                    .multiply(applyRate.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        }

        return interest.setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * 예상 만기일 계산
     */
    public String calculateExpectedEndDate(String startDate, int contractTerm) {
        LocalDate start = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE);
        LocalDate end = start.plusMonths(contractTerm);
        return end.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    /**
     * 최종 가입 처리
     */
    @Transactional
    public boolean processJoin(ProductJoinRequestDTO joinRequest) {
        try {
            log.info("상품 가입 처리 시작 - userId: {}, productNo: {}",
                    joinRequest.getUserId(), joinRequest.getProductNo());

            // UserProductDTO 생성
            UserProductDTO userProduct = UserProductDTO.builder()
                    .userId(joinRequest.getUserId())
                    .productNo(joinRequest.getProductNo())
                    .startDate(joinRequest.getStartDate())
                    .status("A")  // A: 유효
                    .applyRate(joinRequest.getApplyRate())
                    .contractTerm(joinRequest.getContractTerm())
                    .principalAmount(joinRequest.getPrincipalAmount())
                    .expectedEndDate(joinRequest.getExpectedEndDate())
                    .contractEarlyRate(joinRequest.getEarlyTerminateRate())
                    .accountPassword(passwordEncoder.encode(joinRequest.getAccountPassword()))  // 비밀번호 암호화
                    .build();

            // DB INSERT
            int result = userProductMapper.insertUserProduct(userProduct);

            if (result > 0) {
                log.info("상품 가입 완료 - userId: {}, productNo: {}",
                        joinRequest.getUserId(), joinRequest.getProductNo());
                return true;
            } else {
                log.error("상품 가입 실패 - INSERT 결과: 0");
                return false;
            }

        } catch (Exception e) {
            log.error("상품 가입 중 오류 발생", e);
            throw e;
        }
    }

    /**
     * 중복 가입 체크
     */
    public boolean isDuplicateJoin(int userId, int productNo) {
        // UserProductMapper에 조회 메서드 추가 필요
        // 임시로 false 반환
        return false;
    }
}