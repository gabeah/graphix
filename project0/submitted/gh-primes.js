/* 
Gabe Howland Project 0:
primes.js file
*/

function isPrime(n) {
    /* Returns whether n is a prime number. */
    console.log("Isprime started")
    let divs = [];
    if (n < 2) {
        return divs;
    }
    let d = 2;
    while (d <= n/2) {
        // if it has a divisor...
        // add to list
        if (n % d == 0) {
            divs.push(d);
        }
        d++;
    }
    // if it has no divisors...
    // move on
    return divs;
}

function divisors(num) {
    console.log("Divisors started")
    let broadcast_str = "The divisors of "+ num + " are 1";
    let div_list = isPrime(num);
    console.log(div_list)
    for (let i =0; i < div_list.length; i++){
        console.log(i + '\n')
        broadcast_str = broadcast_str + ", " + div_list[i] + ", ";        
    }
    broadcast_str = broadcast_str + " and "+ num;
    return broadcast_str;
}

function primes(n){
    console.log("primes called")
    alert(divisors(n).toString());
}
