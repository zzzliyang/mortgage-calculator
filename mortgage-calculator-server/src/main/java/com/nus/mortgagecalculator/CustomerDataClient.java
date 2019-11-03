package com.nus.mortgagecalculator;

public class CustomerDataClient {

    private String name;
    private String contact;
    private int preferredType;
    private double preferredAmount;

    public CustomerDataClient() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public int getPreferredType() {
        return preferredType;
    }

    public void setPreferredType(int preferredType) {
        this.preferredType = preferredType;
    }

    public double getPreferredAmount() {
        return preferredAmount;
    }

    public void setPreferredAmount(double preferredAmount) {
        this.preferredAmount = preferredAmount;
    }
}
