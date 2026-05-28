//    package onedeoleela.onedeoleela.Coordinator.Util;
//
//    import java.math.BigDecimal;
//
//    import java.math.RoundingMode;
//
//    /**
//     * Converts length × height to square feet based on the selected unit.
//     *
//     * Supported units (case-insensitive):
//     *   mm   → L(mm) × H(mm) / 1,000,000 × 10.764
//     *   cm   → L(cm) × H(cm) / 10,000    × 10.764
//     *   m    → L(m)  × H(m)               × 10.764
//     *   ft   → L(ft) × H(ft)              (already sqft)
//     *   inch → L(in) × H(in) / 144
//     *   sqft → L as-is (no formula; height ignored)
//     *
//     * Result is rounded to 4 decimal places.
//     */
//    public class SqftConverter {
//
//        private static final BigDecimal FACTOR_10764 = new BigDecimal("10.764");
//        private static final BigDecimal DIV_MM       = new BigDecimal("1000000");
//        private static final BigDecimal DIV_CM       = new BigDecimal("10000");
//        private static final BigDecimal DIV_INCH     = new BigDecimal("144");
//
//        private SqftConverter() {}
//
//        /**
//         * @param length numeric value of length (or sqft when unit = "sqft")
//         * @param height numeric value of height (ignored when unit = "sqft")
//         * @param unit   one of: mm | cm | m | ft | inch | sqft
//         * @return sqft value rounded to 4 decimal places
//         * @throws IllegalArgumentException for null inputs or unknown unit
//         */
//        public static BigDecimal convert(BigDecimal length, BigDecimal height, String unit) {
//            if (length == null) throw new IllegalArgumentException("Length must not be null");
//            if (unit   == null) throw new IllegalArgumentException("Unit must not be null");
//
//            String u = unit.trim().toLowerCase();
//
//            // sqft input — take length directly, no height needed
//            if ("sqft".equals(u)) {
//                return length.setScale(4, RoundingMode.HALF_UP);
//            }
//
//            if (height == null) throw new IllegalArgumentException("Height must not be null for unit: " + unit);
//
//            BigDecimal area = length.multiply(height);   // L × H in the source unit²
//
//            BigDecimal result = switch (u) {
//                // mm²  → m²  → sqft :  (L*H / 1_000_000) * 10.764
//                case "mm"   -> area.divide(DIV_MM, 10, RoundingMode.HALF_UP)
//                        .multiply(FACTOR_10764);
//
//                // cm²  → m²  → sqft :  (L*H / 10_000) * 10.764
//                case "cm"   -> area.divide(DIV_CM, 10, RoundingMode.HALF_UP)
//                        .multiply(FACTOR_10764);
//
//                // m²          → sqft :  L*H * 10.764
//                case "m"    -> area.multiply(FACTOR_10764);
//
//                // ft² already sqft  :  L*H
//                case "ft"   -> area;
//
//                // in²  → sqft        :  L*H / 144
//                case "inch" -> area.divide(DIV_INCH, 10, RoundingMode.HALF_UP);
//
//                default -> throw new IllegalArgumentException(
//                        "Unknown unit '" + unit + "'. Use: mm | cm | m | ft | inch | sqft");
//            };
//
//            return result.setScale(4, RoundingMode.HALF_UP);
//        }
//    }

package onedeoleela.onedeoleela.Coordinator.Util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Converts Length × Height (both in millimetres) to square feet.
 *
 * Formula: L(mm) × H(mm) ÷ 1,000,000 × 10.764
 *
 * Result is rounded to 4 decimal places.
 *
 * W/O Qty (Sqft) conversion is handled in WorkOrderService:
 *   - If user unit is "sqft" → value used as-is
 *   - If user unit is "sqm"  → value × 10.764 → sqft
 *
 * W/O QTY (Nos) = floor(woQtySqft / sqft)
 */
public class SqftConverter {

    private static final BigDecimal FACTOR_10764  = new BigDecimal("10.764");
    private static final BigDecimal DIVISOR_MM    = new BigDecimal("1000000");

    private SqftConverter() {}

    /**
     * Main conversion: millimetres → sqft.
     *
     * @param lengthMm length in millimetres (must not be null)
     * @param heightMm height in millimetres (must not be null)
     * @return sqft value rounded to 4 decimal places
     * @throws IllegalArgumentException if either input is null
     */
    public static BigDecimal convertMm(BigDecimal lengthMm, BigDecimal heightMm) {
        if (lengthMm == null) throw new IllegalArgumentException("Length must not be null");
        if (heightMm == null) throw new IllegalArgumentException("Height must not be null");

        return lengthMm
                .multiply(heightMm)
                .divide(DIVISOR_MM, 10, RoundingMode.HALF_UP)
                .multiply(FACTOR_10764)
                .setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * Converts a W/O Qty value to sqft based on user-selected unit.
     *
     * @param rawValue   the value entered by the user
     * @param woQtyUnit  "sqft" → no conversion | "sqm" → × 10.764
     * @return converted value in sqft, rounded to 4 dp
     * @throws IllegalArgumentException if rawValue or woQtyUnit is null
     */
    public static BigDecimal convertWoQty(BigDecimal rawValue, String woQtyUnit) {
        if (rawValue  == null) throw new IllegalArgumentException("rawValue must not be null");
        if (woQtyUnit == null) throw new IllegalArgumentException("woQtyUnit must not be null");

        if ("sqm".equalsIgnoreCase(woQtyUnit.trim())) {
            return rawValue.multiply(FACTOR_10764).setScale(4, RoundingMode.HALF_UP);
        }
        // "sqft" or any unrecognised value → use as-is
        return rawValue.setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * Calculates W/O QTY (Nos) = floor(woQtySqft / sqft).
     * Returns BigDecimal with scale 0 (integer result).
     *
     * @param woQtySqft total W/O qty in sqft
     * @param sqft      area per unit in sqft (must be > 0)
     * @return integer count (floor division)
     */
    public static BigDecimal calcWoQtyNos(BigDecimal woQtySqft, BigDecimal sqft) {
        if (woQtySqft == null || sqft == null || sqft.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return woQtySqft.divide(sqft, 0, RoundingMode.FLOOR);
    }
}