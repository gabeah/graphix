function isPrime(n) {
    /* Returns whether n is a prime number. */
    if (n < 2) {
        return false;
    }
    let d = 2;
    while (d * d <= n) {
        // if it has a divisor...
        if (n % d == 0) {
            return false;
        }
        d++;
    }
    // if it has no divisors...
    return true;
}

function primesTo(n) {
    let ps = [];
    for (let i = 0; i <= n; i++) {
        if (isPrime(i)) {
            ps.push(i);
        }
    }
    return ps;
}

function primes(n) {
    alert(primesTo(n).toString())
}
