package com.nus.mortgagecalculator;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerDataRepository extends JpaRepository<CustomerData, Integer> {

    List<CustomerData> findAllByOrderByStatusDescPreferredAmountDesc();
}
