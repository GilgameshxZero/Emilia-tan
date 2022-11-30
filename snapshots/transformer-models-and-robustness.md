<div class="next-subtitled"></div>

# Transfermer Models and Robustness

February 11, 2022

## A brief on two’s complement

$[0, 128)$ is cleanly represented in 7 binary digits. Of the range $[128, 128)$ to be represented in 8 bits, one may think to use a *offset binary* (ob) representation:

$$n_\text{ob}=n+K$$

with *bias* $K=-128$. For example,

$$\verb|0x00|_\text{ob}=0-128=-128,\\
\verb|0x80|_\text{ob}=128-128=0,\\
\verb|0xff|_\text{ob}=255-128=127.$$

We then have $\verb|0x00|_\text{ob}+\verb|0x80|_\text{ob}=-128+0=\verb|0x00|_\text{ob}\neq\verb|0x80|$ as one may expect from traditional addition. Indeed,

$$n_\text{ob}+m_\text{ob}=n+m+2K\neq n+m+K$$

which is undesireable, as addition for such offset binary representations require different circuits for addition than non-offset representations.

*Two’s complement* (tc) negates the represented value of the most significant bit in offset binary:

Index|Value
-|-
0|-128
$[1,8)$|$2^{8-\text{Index}}$

```c++
char s[]{'\x00', '\x80', '\xff', s[0] + s[1]};
for (int c : s) std::cout << c << ' ';
```

```text
0
-128
-1
-128
```

We now have the desireable property that addition is implemented identically to that of unsigned integers. Overflows of the *sign bit* (index 0) are well-defined by design:

$$-1+1=\verb|0xff|_\text{tc}+1=\verb|0x00|_\text{tc}=0$$

while overflows *into* the sign bit should also be well-defined:

$$127+1=\verb|0x7f|_\text{tc}+1=\verb|0x80|_\text{tc}=-128.$$

Historically, however, two’s complement was not the only signed representation system, and thus signed overflow has [remained undefined behavior](https://stackoverflow.com/questions/18195715/why-is-unsigned-integer-overflow-defined-behavior-but-signed-integer-overflow-is). This was kept to preserve compiler optimizations which simplify arithmetic expressions.

Naturally, for any representation not offset binary, we cannot have the well-ordering property: that the bit-order in comparison is preserved from unsigned to signed. Hence, preserving addition is a worthwhile trade-off.

<div class="next-subtitled"></div>

## Half-width floating point representations

<https://en.wikipedia.org/wiki/Bfloat16_floating-point_format>

Floating point representation bits are typically allocated between 3 contiguous parts. For `bfloat16`, more bits are allocated to the exponent than the fraction.

Part|Bits|Usage
-|-|-
Sign|1|0 for positive, 1 for negative.
Exponent|8|`0xFF` for infinity & `NaN`, `0x00` for subnormal numbers (increased precision around 0), everything else in offset binary `K=-127` for exponent base `2`.
Fraction|7|Negative-power base `2`.
