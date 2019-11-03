package com.nus.mortgagecalculator;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

public class CustomerDataSales {

    private int id;
    private String name;
    private String contact;
    private String preferredType;
    private double preferredAmount;
    private String status;
    private LocalDateTime createdTime;

    public CustomerDataSales() {
    }

    public CustomerDataSales(int id, String name, String contact, String preferredType, double preferredAmount, String status, LocalDateTime createdTime) {
        this.id = id;
        this.name = name;
        this.contact = contact;
        this.preferredType = preferredType;
        this.preferredAmount = preferredAmount;
        this.status = status;
        this.createdTime = createdTime;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getPreferredType() {
        return preferredType;
    }

    public void setPreferredType(String preferredType) {
        this.preferredType = preferredType;
    }

    public double getPreferredAmount() {
        return preferredAmount;
    }

    public void setPreferredAmount(double preferredAmount) {
        this.preferredAmount = preferredAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }
}
