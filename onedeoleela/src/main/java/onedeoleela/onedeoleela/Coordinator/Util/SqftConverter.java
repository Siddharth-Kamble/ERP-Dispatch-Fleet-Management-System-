

package onedeoleela.onedeoleela.Coordinator.Util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class SqftConverter {

    private static final BigDecimal FACTOR_10764  = new BigDecimal("10.764");
    private static final BigDecimal DIVISOR_MM    = new BigDecimal("1000000");

    private SqftConverter() {}


    public static BigDecimal convertMm(BigDecimal lengthMm, BigDecimal heightMm) {
        if (lengthMm == null) throw new IllegalArgumentException("Length must not be null");
        if (heightMm == null) throw new IllegalArgumentException("Height must not be null");

        return lengthMm
                .multiply(heightMm)
                .divide(DIVISOR_MM, 10, RoundingMode.HALF_UP)
                .multiply(FACTOR_10764)
                .setScale(4, RoundingMode.HALF_UP);
    }


    public static BigDecimal convertWoQty(BigDecimal rawValue, String woQtyUnit) {
        if (rawValue  == null) throw new IllegalArgumentException("rawValue must not be null");
        if (woQtyUnit == null) throw new IllegalArgumentException("woQtyUnit must not be null");

        if ("sqm".equalsIgnoreCase(woQtyUnit.trim())) {
            return rawValue.multiply(FACTOR_10764).setScale(4, RoundingMode.HALF_UP);
        }
        // "sqft" or any unrecognised value → use as-is
        return rawValue.setScale(4, RoundingMode.HALF_UP);
    }


    public static BigDecimal calcWoQtyNos(BigDecimal woQtySqft, BigDecimal sqft) {
        if (woQtySqft == null || sqft == null || sqft.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return woQtySqft.divide(sqft, 0, RoundingMode.FLOOR);
    }
}