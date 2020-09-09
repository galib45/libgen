/*console.log("Hudai");
var templateText = document.getElementById("template").innerHTML;
var template = Handlebars.compile(templateText);
document.getElementById("content").innerHTML = template({heading: "Hudai"});*/

function buildContent(results) {
    var templateText = document.getElementById("template").innerHTML;
    var template = Handlebars.compile(templateText);
    document.querySelector(".content").innerHTML = template({
        results: results,
        summary: {
            keyword: searchText,
            books: books,
            start: (currentPage-1)*25+1,
            end: Math.min(books, currentPage*25),
            current: currentPage,
            pages: pages
        }
    });

    var next = document.getElementById("next");
    var prev = document.getElementById("previous");
    if(currentPage == pages) {
        next.disabled = true;
    }
    if(currentPage == 1) {
        prev.disabled = true;
    }
    prev.addEventListener('click', function() {
        currentPage -= 1;
        document.querySelector(".content").innerHTML = '';
        fetchResults(url);
    });

    next.addEventListener('click', function() {
        currentPage += 1;
        document.querySelector(".content").innerHTML = '';
        fetchResults(url);
    });
}

function makeUrl(keyword) {
    //https://thingproxy.freeboard.io/fetch/
    //https://cors-proxy.htmldriven.com/?url=
    var proxy = 'https://cors-anywhere.herokuapp.com/';
    var url = new URL('https://libgen.lc/search.php');
    url.searchParams.set('req', keyword);
    url.searchParams.set('view', 'detailed');
    url.searchParams.set('sort', 'year');
    url.searchParams.set('sortmode', 'DESC');
    return proxy+url.href;
}

function fetchResults(url) {
    url = url + '&page=' + currentPage;
    searchButton.disabled = true;
    spinner.classList.toggle('spinner');
    fetch(url)
    .then(function(res) {
        return res.text()
    }).then(function(html) {
        parseHTML(html);
        searchButton.disabled = false;
        spinner.classList.toggle('spinner');
    }).catch(function(err) {
        console.log(err);
        alert(err);
    });
}

function parseHTML(html) {
    var parser = new DOMParser();
    var htmldoc = parser.parseFromString(html, 'text/html');
    var filesFound = htmldoc.querySelector('font[color=grey]').innerHTML;
    books = parseInt(filesFound);
    pages = Math.ceil(books/25);
    console.log(books, pages);
    if(books != 0) {
        var results = htmldoc.querySelectorAll('body > table[rules=cols]');
        var resultsArray = Array.from(results);
        results = resultsArray.map(function(item) {
            return resultObject(results[resultsArray.indexOf(item)].querySelectorAll('td'));
        });
        buildContent(results);
    }
}

function resultObject(data) {
    var size = data[32].innerText;
    var link = data[1].innerHTML;
    var base = 'https://libgen.lc';
    var img = base + link.substring(
        link.search('img src')+9,
        link.search('" border')
    );
    link = base + link.substring(
        link.search('/ads'),
        link.search('"><img')
    );
    link = link.replace('&amp;', '&');
    size = parseInt(size.substring(
        size.search(/\(/)+1,
        size.search(/\)/)
    ));
    var sizeStrings = ['B', 'kB', 'MB', 'GB'];
    var power = Math.floor(Math.log(size)/Math.log(1024));
    size = (size/Math.pow(1024, power)).toFixed(2)+' '+sizeStrings[power];

    return {
        title: data[3].innerText,
        auth: data[6].innerText,
        pub: data[12].innerText,
        year: data[16].innerText,
        ed: data[18].innerText,
        pages: data[22].innerText,
        ext: data[34].innerText,
        size: size,
        link: link,
        img: img
    };
}

var searchButton = document.querySelector('#search');
var keyword = document.querySelector('#keyword');
var errorText = document.querySelector('.error');
var spinner = document.querySelector('#spinner');
errorText.style.display = 'none';

var books=0, pages=0, currentPage=1, searchText='', url='';

searchButton.addEventListener('click', function() {
    if(keyword.value == '') {
        errorText.style.display = 'block';
    } else {
        errorText.style.display = 'none';
        searchText = keyword.value;
        console.log("Searching... " + keyword.value);
        url = makeUrl(keyword.value);
        fetchResults(url);
    }
});