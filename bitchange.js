/*
 * BitChange.js v1.0
 * https://github.com/TheJF/BitChangeJS
 *
 * Copyright 2012 Jean-Francois Arseneau
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 */


$(document).ready(function()
{

/* mtgox object that stores relevant values */
window.mtgox =
{
	// MtGox API is passed through YQL to allow cross-domain requests from anywhere
	// and to make sure it returns properly MIME-typed JSON
	btcusdURL : 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fmtgox.com%2Fapi%2F1%2FBTCUSD%2Fticker%22&format=json&callback=?',
	btccadURL : 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fmtgox.com%2Fapi%2F1%2FBTCUSD%2Fticker%22&format=json&callback=?',
	btceurURL : 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fmtgox.com%2Fapi%2F1%2FBTCEUR%2Fticker%22&format=json&callback=?',
	btcjpyURL : 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fmtgox.com%2Fapi%2F1%2FBTCJPY%2Fticker%22&format=json&callback=?',
	btcgbpURL : 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fmtgox.com%2Fapi%2F1%2FBTCGBP%2Fticker%22&format=json&callback=?',
	btccnyURL : 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22https%3A%2F%2Fmtgox.com%2Fapi%2F1%2FBTCCNY%2Fticker%22&format=json&callback=?',
}

/* arrays specifying what classes are valid for conversion */
window.bitcoinFiat = ['btcusd', 'btccad', 'btceur', 'btcjpy', 'btcgbp', 'btccny'];
window.fiatBitcoin = ['usdbtc', 'cadbtc', 'eurbtc', 'jpybtc', 'gbpbtc', 'cnybtc'];
window.bitcoinFiatClasses = '.btcusd, .btccad, .btceur, .btcjpy, .btcgbp, .btccny';
window.fiatBitcoinClasses = '.usdbtc, .cadbtc, .eurbtc, .jpybtc, .gbpbtc, .cnybtc';
window.conversions = bitcoinFiat.concat(fiatBitcoin);

// Store values by default so toggling works.
setDefaultValues();
// load the rates
setupRates();

/* hover over event to toggle between Bitcoin/fiat currencies */
$(bitcoinFiatClasses).hover(

	// on mouse over
	function () {

		var currencyConversion = getConversionType(this);

		originalValue = $(this).val();

		avgValue = getAverageValue(currencyConversion);

		if (avgValue != 0) // don't run if the JSON failed to load
		{
			exchangedValue = originalValue*avgValue;
			exchangedValue = roundNumber(exchangedValue, 2); // make it look like a currency
			$(this).html(getSymbol(this)+exchangedValue);
		}
	},

	// on mouse out
	function () {
		$(this).html('Ƀ'+$(this).val());
	}
);

/* hover event to toggle between fiat currencies/Bitcoin */
$(fiatBitcoinClasses).hover(
	// on mouse over
	function () {
		originalValue = $(this).val();
		var currencyConversion = getConversionType(this);

		avgValue = getAverageValue(currencyConversion);
		if (avgValue != 0)
		{
			exchangedValue = originalValue/avgValue;
			exchangedValue = roundNumber(exchangedValue, 2); // make it look like a currency
			$(this).html('Ƀ'+exchangedValue);
		}
	},

	// on mouse out
	function () {
		$(this).html(getSymbol(this)+$(this).val());
	}
);


/* setDefaultValues:
grabs the original values and stores them for toggling */
function setDefaultValues()
{
	var bitcoinFiatClasses = '';
	// transform the bitcoinFiat array values into class selectors
	for (var i=0; i<bitcoinFiat.length; i++)
	{
		bitcoinFiatClasses = bitcoinFiatClasses + '.' + bitcoinFiat[i] + ",";
	}

	// grab the actual bitcoinFiat classed elements
	var bitcoinAmounts = $(bitcoinFiatClasses);

	for (var j=0; j<bitcoinAmounts.length; j++)
	{
		$(bitcoinAmounts[j]).val(bitcoinAmounts[j].innerHTML);
		$(bitcoinAmounts[j]).prepend('Ƀ');
	}

	// now do the same for the opposite direction!
	var fiatBitcoinClasses = '';
	for (var k=0; k<fiatBitcoin.length; k++)
	{
		fiatBitcoinClasses = fiatBitcoinClasses + '.' + fiatBitcoin[k] + ",";
	}

	var fiatAmounts = $(fiatBitcoinClasses);
	for (var l=0; l<fiatAmounts.length; l++)
	{
		$(fiatAmounts[l]).val(fiatAmounts[l].innerHTML);
		$(fiatAmounts[l]).prepend(getSymbol(fiatAmounts[l]));
	}
}

/* roundNumber:
rounds a given number (number) off to n decimal places (digits) */
function roundNumber(number, digits)
{
	multiple = Math.pow(10, digits);
	roundedNumber = Math.round(number * multiple) / multiple;

	// Add zeroes if necessary to make it look like a monetary amount
	stringifiedNumber = String(roundedNumber);
	if (stringifiedNumber.split('.')[1] < 10)
		roundedNumber = roundedNumber + "0";
	else if (stringifiedNumber.split('.')[1] === undefined)
		roundedNumber = roundedNumber + ".00";

	return roundedNumber;
}

/* getSymbol:
returns the symbol associated to that element's fiat currency */
function getSymbol(element)
{
	var amountClass = getConversionType(element);
	amountClass = standardizeCurrencyConversion(amountClass);

	switch(amountClass)
	{
		case "btcusd":
		case "btccad":
			return "$";
		case "btceur":
			return "€";
		case "btcjpy":
		case "btccny":
			return "¥";
		case "btcgbp":
			return "£";
		default:
			return ''; // unknown symbol
	}

	return false;
}

/* setupRates:
loads the rates for all the conversion types on the page */
function setupRates()
{
	// only load the relevant currencies used on the page
	for (var i=0; i<bitcoinFiat.length; i++)
	{
		var amounts = '';
		amounts = $('.'+bitcoinFiat[i]);
		
		if (amounts.length > 0)
		{
			loadRates(bitcoinFiat[i]);
		}
	}

	return true;
}

/* loadRates:
loads the rate specified by currencyConversion from MtGox */
function loadRates(currencyConversion)
{

	currencyConversion = standardizeCurrencyConversion(currencyConversion);
	if (window.mtgox[currencyConversion] === undefined) // if already loaded, no point loading it again
	{
		$.ajax(
		{
			type: 'GET',
			url: mtgox[currencyConversion+'URL'],
			dataType: 'json',
			success: function(data)
			{
				window.mtgox[currencyConversion] = data.query.results.json.return;
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				console.log(errorThrown);
			}
		});
	}

	return true;
}

/* standardizeCurrencyConversion:
make both directions of currency conversion refer to only one value */
function standardizeCurrencyConversion(currencyConversion)
{
	switch (currencyConversion)
	{
		case 'usdbtc':
			currencyConversion = 'btcusd';
			break;
		case 'cadbtc':
			currencyConversion = 'btccad';
			break;
		case 'eurbtc':
			currencyConversion = 'btceur';
			break;
		case 'jpybtc':
			currencyConversion = 'btcjpy';
			break;
		case 'gbpbtc':
			currencyConversion = 'btcgbp';
			break;
		case 'cnybtc':
			currencyConversion = 'btccny';
			break;
	}

	return currencyConversion;
}

/* getAverageValue:
get the latest average value stored in memory */
function getAverageValue(currencyConversion)
{
	currencyConversion = standardizeCurrencyConversion(currencyConversion);
	if (window.mtgox[currencyConversion] === undefined)
	{
		console.log('JSON failed to load');
		return 0;
	}
	return window.mtgox[currencyConversion].avg.value;
}

/* getConversionType:
get the type of conversion that will be done*/
function getConversionType(element)
{
	// grab all of this object's classes to then find which one matches
	classes = $(element).attr('class');
	classes = classes.split(' ');

	// find the match. there should always be at least one match, or
	// else this function wouldn't have triggered.
	var currencyConversion = '';
	for (var i = 0; i<classes.length; i++)
	{	
		for (var j = 0; j<conversions.length; j++)
		{
			if (classes[i] === conversions[j])
				return classes[i]
		}
	}

	return false;
}

});
