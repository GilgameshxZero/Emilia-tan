# Of Recurrences and Convolutions

November 25, 2022

It’s difficult to overstate the cumulative weight and subsequent deliverance of all manner of wrongs and wrongdoings, in the three years since my last writing. Unfortunately, I remain the most qualified detective for all things myself.

![](of-recurrences-and-convolutions.md-assets/amelia-watson.png)
*Amelia Watson, a detective of trivial namesake, from Hololive’s first generation of English VTubers, denoted *Myth*.*

To kick off this investigation, then, I’d like to briefly explore the following technical problem.

[Codeforces 1761D](https://codeforces.com/contest/1761/problem/D) asks

> Given $N$ and $K$, count the number of ordered pairs of $N$-bit integers, such that we observe $K$ *carry* operations while computing their sum. Count this number modulo some prime $P$.

As a contest problem with limits $K\leq N\leq 1e6$, we should compute the answer in $O((N+K)\ln(N+K))$ time. It turns out, interestingly enough, that there are several highly distinct ways of satisfying this bound.

1. A combinatorial re-interpretation of the problem. A daring and somewhat experienced reader may hypothesize that this solution involves computing the answer as sum of a row or diagonal of Pascal’s triangle, where each element is scaled by $3$ raised to some power. Interpreted alternatively, the hypothesis is the following expression

   $$A_{N,K}=\sum_i 3^{L_{i,0}(N,K,i)}{L_{i,1}(N,K,i)\choose L_{i,2}(N,K,i)}.$$

   where each $L_*(N,K,i)$ is a linear combination of $N,K,i$, with some restrictions. Unfortunately, this hypothesis turns out to be close, but wrong, and the answer is in fact of the form

   $$A_{N,K}=\sum_i 3^{L_{i,0}(N,K,i)}{L_{i,1}(N,K,i)\choose L_{i,2}(N,K,i)}{L_{i,3}(N,K,i)\choose L_{i,4}(N,K,i)}.\tag{0.1}$$

2. An analytical approach derived via dynamic programming (DP), which leads to solving the recurrence

   $$A_{N,K}=3A_{N-1,K}+3A_{N-1,K-1}-8A_{N-2,K-1}$$

	 with initial conditions $A_{0,j}=3^j$ and $A_{i,i}=3^{i-1}$ for $i>0$. Visually, this generates Pascal-like triangle
	 
	 ```txt
	 1
	 3  1
	 9  4  3
	 27 15 13 9
	 ```

	 As one might reasonably expect, row $i$ sums to $2^i$.

	 One can reasonably hypothesize that bivariate generating functions could be a reasonable approach to solving this recurrence. Of course, the solution to this recurrence is necessarily the same as equation $(0.1)$.

3. A divide-and-conquer approach, where each half of a given $n$ bits is solved independently for each $k\leq K$, and merged in $O(n^2)$ operations. The merge demonstrates an obvious convolutional structure, and can thus be optimized via number theoretic transforms (NTT) to satisfy runtime bounds.

> You’re finally awake. You were trying to cross that border, right? Walked right into Imperial ambush, same as us, and that thief over there.

Like the unsuspecting 旅行者 thrust into the world of Teyvat, that we are accompanied first by Amber in Mondstadt is about as likely as being accompanied by Fourier in the unlikely context of modern graphical applications.

![](of-recurrences-and-convolutions.md-assets/2022-11-25-16-44-28.png)

I do hope Díaz of his Pulitzer fame would find this writing a misappropriation of the prototypical hero’s journey, but perhaps such prosthetic beginnings are more suitably designated as deconstructions. There is, of course, little wiggle room from the world of 原神 to where I left off, three years ago.

## Emilia, DPS, and Trade School
