// =============================================================================
// File: sha256_round_stage.sv
// Module: sha256_round_stage
// Project: Wikialisa Core & AXQ Hardware Architecture
// Description: Fully Pipelined Single Round Stage for Hardware SHA-256
// =============================================================================

`timescale 1ns / 1ps

module sha256_round_stage #(
    parameter logic [31:0] K_CONST = 32'h428a2f98
)(
    input  logic        clk,
    input  logic        rst_n,
    input  logic [31:0] a_in, b_in, c_in, d_in, e_in, f_in, g_in, h_in,
    input  logic [31:0] w_in,
    output logic [31:0] a_out, b_out, c_out, d_out, e_out, f_out, g_out, h_out
);

    // Hàm xoay vòng bit sang phải (Right Rotate)
    function automatic logic [31:0] rotr(input logic [31:0] x, input int n);
        return (x >> n) | (x << (32 - n));
    endfunction

    logic [31:0] s1, ch, temp1, s0, maj, temp2;

    assign s1    = rotr(e_in, 6) ^ rotr(e_in, 11) ^ rotr(e_in, 25);
    assign ch    = (e_in & f_in) ^ ((~e_in) & g_in);
    assign temp1 = h_in + s1 + ch + K_CONST + w_in;
    assign s0    = rotr(a_in, 2) ^ rotr(a_in, 13) ^ rotr(a_in, 22);
    assign maj   = (a_in & b_in) ^ (a_in & c_in) ^ (b_in & c_in);
    assign temp2 = s0 + maj;

    // Chuyển kết quả sang thanh ghi đường ống kế tiếp theo xung nhịp
    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            a_out <= 32'h0;
            b_out <= 32'h0;
            c_out <= 32'h0;
            d_out <= 32'h0;
            e_out <= 32'h0;
            f_out <= 32'h0;
            g_out <= 32'h0;
            h_out <= 32'h0;
        end else begin
            h_out <= g_in;
            g_out <= f_in;
            f_out <= e_in;
            e_out <= d_in + temp1;
            d_out <= c_in;
            c_out <= b_in;
            b_out <= a_in;
            a_out <= temp1 + temp2;
        end
    end

endmodule
