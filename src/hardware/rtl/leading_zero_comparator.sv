// =============================================================================
// File: leading_zero_comparator.sv
// Module: leading_zero_comparator
// Project: Wikialisa Core & AXQ Hardware Architecture
// Description: Single-Cycle Parallel Leading Zeros Target Difficulty Checker
// =============================================================================

`timescale 1ns / 1ps

module leading_zero_comparator (
    input  logic [255:0] hash_in,
    input  logic [7:0]   required_zeros,
    output logic [7:0]   counted_zeros,
    output logic         target_matched
);

    // Mạch tổ hợp đếm số lượng bit 0 liên tiếp từ bit cao nhất (MSB)
    always_comb begin
        counted_zeros = 8'd0;
        for (int i = 255; i >= 0; i--) begin
            if (hash_in[i] == 1'b0) begin
                counted_zeros = counted_zeros + 8'd1;
            end else begin
                break;
            end
        end
        
        target_matched = (counted_zeros >= required_zeros);
    end

endmodule
