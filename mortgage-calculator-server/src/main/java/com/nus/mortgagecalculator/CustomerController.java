package com.nus.mortgagecalculator;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class CustomerController {

    @Autowired
    private CustomerDataRepository customerDataRepository;

    @GetMapping("/customerdata")
    public String getAllCustomerData() {
        Gson gson = new GsonBuilder()
                .setPrettyPrinting()
                .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
                .create();
        List<CustomerDataSales> customerData = customerDataRepository.findAllByOrderByStatusDescPreferredAmountDesc().stream().map(c ->
                new CustomerDataSales(
                        c.getId(),
                        c.getName(),
                        c.getContact(),
                        getPrefferedType(c.getPreferredType()),
                        c.getPreferredAmount(),
                        CustomerStatus.getStatus(c.getStatus()).name(),
                        c.getCreatedTime()
                )).collect(Collectors.toList());
        return gson.toJson(customerData);
    }

    @PostMapping("/newcustomer")
    CustomerData newCustomer(@RequestBody CustomerDataClient customerDataClient) {
        return customerDataRepository.save(new CustomerData(
                customerDataClient.getName(),
                customerDataClient.getContact(),
                customerDataClient.getPreferredType(),
                customerDataClient.getPreferredAmount(),
                CustomerStatus.PENDING.getValue(),
                LocalDateTime.now()
        ));
    }

    @PostMapping("/deletecustomer")
    CustomerData deleteCustomer(@RequestBody CustomerStatusUpdateClient client) {
        Optional<CustomerData> customerDataOptional = customerDataRepository.findById(client.getId());
        if (customerDataOptional.isPresent()) {
            CustomerData customerData = customerDataOptional.get();
            customerData.setStatus(CustomerStatus.PURGED.getValue());
            customerDataRepository.save(customerData);
            return customerData;
        }
        return null;
    }

    @PostMapping("/flagcustomer")
    CustomerData flagCustomer(@RequestBody CustomerStatusUpdateClient client) {
        Optional<CustomerData> customerDataOptional = customerDataRepository.findById(client.getId());
        if (customerDataOptional.isPresent()) {
            CustomerData customerData = customerDataOptional.get();
            customerData.setStatus(CustomerStatus.IMPORTANT.getValue());
            customerDataRepository.save(customerData);
            return customerData;
        }
        return null;
    }

    private static String getPrefferedType(int i) {
        /*<Option value={0}>Fixed Package</Option>
                                    <Option value={1}>Floating Package</Option>
                                    <Option value={2}>No Preference</Option>*/
        switch (i) {
            case 0:
                return "Fixed Package";
            case 1:
                return "Floating Package";
            case 2:
                return "No Preference";
            default:
                return "";
        }
    }
}
