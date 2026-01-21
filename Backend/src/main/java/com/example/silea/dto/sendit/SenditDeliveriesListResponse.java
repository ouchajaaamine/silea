package com.example.silea.dto.sendit;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response DTO for listing deliveries from Sendit.ma
 */
public class SenditDeliveriesListResponse {
    
    @JsonProperty("data")
    private List<SenditDeliveryResponse> data;
    
    @JsonProperty("current_page")
    private int currentPage;
    
    @JsonProperty("total_pages")
    private int totalPages;
    
    @JsonProperty("total_count")
    private int totalCount;
    
    // Constructors
    public SenditDeliveriesListResponse() {}
    
    // Getters and Setters
    
    public List<SenditDeliveryResponse> getData() {
        return data;
    }
    
    public void setData(List<SenditDeliveryResponse> data) {
        this.data = data;
    }
    
    public int getCurrentPage() {
        return currentPage;
    }
    
    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }
    
    public int getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
    
    public int getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
}
