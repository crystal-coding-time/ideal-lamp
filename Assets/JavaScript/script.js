// Below are our global varibles
const APIKEY = 'AIzaSyCGt6hDWBgYbjPW9h_jdA7i9c6iHsjiLYA';
const youtubeAPI = 'https://www.googleapis.com/youtube/v3/search?maxResults=5&key=';
let youtubeDisplay = document.getElementById('youtube-video');
const searchButton = document.querySelector('#search-btn');
const clearButton = document.querySelector('#clear-btn');


// Attach a click event listener to the search button
searchButton.addEventListener('click', function(event) {
    event.preventDefault(); // prevent the default form submission behavior
    const searchTerm = document.querySelector('#searchInput').value; // get the search term from the input field
    getWikiInfo(searchTerm); // call the getWikiInfo function with the search term
    getYouTube(searchTerm); // call the getYouTube function with the search term
    storePastSearches(searchTerm); // store the search term in local storage
    displayPastSearches(); // update the past searches display
  });
  
// Attach a click event listener to the clear button to clear the local storage
  clearButton.addEventListener('click', function (event) {
    // retrieve past searches from local storage
    const storedSearches = JSON.parse(localStorage.getItem('pastSearches'));
    
    if (storedSearches) { // if past searches exist
      localStorage.clear(); // clear the local storage
      const oldButtons = document.querySelectorAll('.history-btns'); // select all history buttons
      oldButtons.forEach(button => button.remove()); // remove each history button
    }
  });  


// Function that takes in a searchTerm parameter and makes a fetch request to the YouTube API
var getYouTube = function (searchTerm) {
    // Construct the YouTube search URL with the search term and API key
    let searchYouTube = youtubeAPI + APIKEY + '&part=snippet&videoCategoryId=27&type=video&q=' + searchTerm;
  
    // Make a fetch request to the YouTube API with the constructed URL
    fetch(searchYouTube)
      .then(function (response) { // When the response is returned
        return response.json(); // Parse the response as JSON
      }).then(function (data) { // When the JSON data is returned
        displayVideos(data); // Call the displayVideos function with the data
      }).catch(function (error) { // If there is an error
        console.log(error); // Log the error to the console
      });
  };
  

// Define a function called displayVideos that takes in a data parameter
function displayVideos(data) {
  // Clear the current contents of the YouTube video container element
  youtubeDisplay.innerHTML = '';

  // Loop through each video item in the data
  for (let i = 0; i < data.items.length; i++) {
    // Get the video ID for the current item
    const videoIDLoop = data.items[i].id.videoId;
    console.log(videoIDLoop);

    // Bootstrap responsive iframe with the video ID to the YouTube video container element
    youtubeDisplay.innerHTML += `
    <div class="embed-responsive embed-responsive-16by9 ">
      <div class="mx-auto">
        <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/${videoIDLoop}" allowfullscreen></iframe>
      </div>
    </div>
  `;
  }
};


var getWikiInfo = function (searchTerm) {
    var wikiURL = 'https://en.wikipedia.org/w/rest.php/v1/search/page?q=' + searchTerm + '&limit=1';
    fetch(wikiURL)
        .then(function (response) {
            return response.json();
        }).then(function (data) {

            console.log(data[0]);
            putWikiOnPage(data.pages[0]);
        }).catch(function (error) {
            console.log(error);
        });
};

var putWikiOnPage = function (data) {
  
    //this adds in the title of the wiki page into the html
    var wikiTitle = document.querySelector("#wiki-title");
    wikiTitle.innerHTML= data.title;
    //this adds in the page's icon as an html element on the page
    //some of the articles do not have a thumbnail image, so if the thumbnail is null we don't create an element for it
    //TODO: figure out how to make icon bigger?
    if (data.thumbnail !== null) {
    var wikiIcon = document.querySelector("#wiki-icon");
    wikiIcon.setAttribute("src", "https:" + data.thumbnail.url);
    } else {
    var wikiIcon = document.querySelector("#wiki-icon");
    wikiIcon.setAttribute("src", "./Assets/Images/lightbulb-icon.png" );
    }
    //adds article description to page
    var wikiDescr = document.querySelector("#wiki-description");
    wikiDescr.innerHTML = data.description;
    //adds brief summary/excerpt to page
    var wikiExcerpt = document.querySelector("#wiki-excerpt");
    wikiExcerpt.innerHTML = data.excerpt + ' ... ';

    //adds wikipedia article's url
    var articleURL = document.querySelector("#wiki-link");
    articleURL.setAttribute("href", 'https://en.wikipedia.org/?curid=' + data.id);
    articleURL.innerHTML = 'https://en.wikipedia.org/?curid=' + data.id;
    

}

//This function stores the current searchTerm in an array of storedSearches, and sets storedSearches up in local storage so that past searches are saved in the user's browser
var storePastSearches = function (searchTerm) {
    storedSearches = JSON.parse(localStorage.getItem("pastSearches"));
    if (storedSearches !== null) {
    storedSearches.push(searchTerm);
    localStorage.setItem("pastSearches", JSON.stringify(storedSearches));
    } else {
        searchTerm = [searchTerm];
        localStorage.setItem("pastSearches", JSON.stringify(searchTerm));
    }
}
var displayPastSearches = function () {
    storedSearches = JSON.parse(localStorage.getItem("pastSearches"));
    if (storedSearches !== null) {
        //if there is existing search history, we first remove each of the history buttons already displayed on the page
        //so that we do not have duplicate buttons when we do a new search and update the buttons to the most recent searches
        var oldBtns = $(".history-btns");
        for (i=0; i < oldBtns.length; i++) {
            oldBtns.remove();
        }

        for (i=0; i < storedSearches.length; i++) {
            var histbtn = document.createElement("button");
            histbtn.type = "submit";
            histbtn.name = "search-history-btn";
            histbtn.innerHTML = storedSearches[i];
            histbtn.setAttribute("class", "history-btns button has-text-warning has-background-black is-outlined is-rounded is-inverted");
            histbtn.setAttribute("id", `hist-btn-${[i]}`);
            $("#search-history-box").append(histbtn);
        }
    }


    //this event listener looks for when one of the search history buttons was clicked, and identifies the text of that button
    $(".history-btns").on("click", function (event) {
        event.preventDefault();
        //we set the current searchTerm equal to whatever city name was clicked on in our search history
        searchTerm = this.innerHTML;
        //then we can do the process of running another search for that term
        getWikiInfo(searchTerm);
        getYouTube(searchTerm);
    });
}
//calling this function again outside of the other functions makes sure the past searches 
//are displayed as buttons even when the page first opens or is refreshed, 
//not only when we trigger the updated display with a new search
displayPastSearches();
