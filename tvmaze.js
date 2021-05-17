/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
	const res = await axios.get('http://api.tvmaze.com/search/shows', {
		params: { q: `${query}` }
	});

	// get() returns an array of shows. Use map() to iterate through results and populate a new array with id, name, summary, and image info
	let shows = res.data;
	shows = shows.map((result) => {
		return {
			id: result.show.id,
			name: result.show.name,
			summary: result.show.summary,
			image: result.show.image.medium ? result.show.image.medium : 'https://tinyurl.com/tv-missing'
		};
	});

	return shows;
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
	const $showsList = $('#shows-list');
	$showsList.empty();

	for (let show of shows) {
		let $item = $(
			`<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src="${show.image}" alt="Card image cap">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-success getEpisodes">Episodes</button>
           </div>
         </div>
       </div>
      `
		);

		$showsList.append($item);
	}
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */
$('#search-form').on('submit', async function handleSearch(evt) {
	evt.preventDefault();

	let query = $('#search-query').val();
	if (!query) return;

	$('#episodes-area').hide();

	let shows = await searchShows(query);

	populateShows(shows);
});

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */
async function getEpisodes(id) {
	const episodeList = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

	return episodeList.data;
}

// Empties ul containing episode list and then iterates over an array of episodes, populating the ul with name, season, and number for each.
function populateEpisodes(episodes) {
	const $ul = $('#episodes-list');
	$ul.empty();

	for (let episode of episodes) {
		let $newEp = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);

		$ul.append($newEp);
	}

	$('#episodes-area').show();
}

// Upon click on button, locates the closest card and references the show id to pull episodes using getEpisodes, then populates using populateEpisodes
$('#shows-list').on('click', '.getEpisodes', async function() {
	const id = $(this).closest('.card').data('show-id');
	const episodes = await getEpisodes(id);
	populateEpisodes(episodes);
});
