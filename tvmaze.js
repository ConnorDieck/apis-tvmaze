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
	const res = await axios.get('http://api.tvmaze.com/singlesearch/shows', {
		params: { q: `${query}` }
	});

	const id = res.data.id;
	const name = res.data.name;
	const summary = res.data.summary;
	const image = res.data.image.medium;

	return [
		{
			id,
			name,
			summary,
			image
		}
	];
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
	const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

	// Use map() to iterate through episode array and return a new array of objects with episode id, name, season and number
	const episodes = res.data.map((episode) => ({
		id: episode.id,
		name: episode.name,
		season: episode.season,
		number: episode.number
	}));

	// console.log(episodes);
	return episodes;
}

// TODO (5/15): finish populateEpisodes and button event listener
function populateEpisodes(episodes) {
	const $ul = $('#episodes-list');

	for (let episode of episodes) {
		let $newEp = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})`);
		$ul.append($newEp);
	}

	$('#episodes-area').show();
}

$('episodes-list').on('click', 'getEpisodes', async function(e) {
	const id = $(e.target).closest('.card').data('showId');
	const episodes = await getEpisodes(id);
	populateEpisodes(episodes);
});
