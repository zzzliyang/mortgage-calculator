package com.nus.mortgagecalculator;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class CustomerData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String contact;
    private int preferredType;
    private double preferredAmount;
    private int status;
    private LocalDateTime createdTime;

    public CustomerData() {
    }

    public CustomerData(String name, String contact, int preferredType, double preferredAmount, int status, LocalDateTime createdTime) {
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

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }
}
