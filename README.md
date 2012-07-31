BitChange.js
============

BitChange.js is a jQuery plugin that displays the current MtGox exchange rate 
when hovering over a Bitcoin amount.

Usage
-----

First, BitChange.js must be included in the head section of your page:

    <head>
        <meta charset="utf-8" />
        <title>Your Web Page</title>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
        <script src="bitchange.js" type="text/javascript"></script>
    </head>


Then, to make it work when hovering over a Bitcoin amount, put the amount 
between a tag and put in a class that matches the exchange you want to show.
For example, if I want to show the exchange rate of Bitcoins for US dollars,
I would type in:

    <span class="btcusd">5.00</span>

This would automatically prepend a Bitcoin symbol in front of the amount (Ƀ)
which will change to a dollar symbol, along with the amount reflecting the current
average value on MtGox in US dollars. You can do the opposite by showing the
exchange rate for US dollars to Bitcoin by changing the class to `usdbtc`.

The full list of exchanges supported by BitChange.js are:
+ `btcusd`, `usdbtc`
+ `btccad`, `cadbtc`
+ `btceur`, `eurbtc`
+ `btcjpy`, `jpybtc`
+ `btcgbp`, `gbpbtc`
+ `btccny`, `cnybtc`

Contributions, Issues, Comments
-------------------------------
Throw them my way, I'll do my best to answer them. Also feel free to fork and modify!