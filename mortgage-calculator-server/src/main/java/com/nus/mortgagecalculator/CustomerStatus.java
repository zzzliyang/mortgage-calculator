package com.nus.mortgagecalculator;

public enum CustomerStatus {
    PENDING(1),
    PURGED(0),
    IMPORTANT(2);

    private final int value;

    CustomerStatus(int i) {
        value = i;
    }

    public static CustomerStatus getStatus(int i) {
        for (CustomerStatus c: CustomerStatus.values()) {
            if (c.getValue() == i) {
                return c;
            }
        }
        return null;
    }

    public int getValue() {
        return value;
    }
}
