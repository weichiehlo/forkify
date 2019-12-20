import Search from './models/Search';
import {elements} from './views/base';
import * as searchView from './views/searchView';

/**Global state of the app
 * --Search object
 * --Current recipe object
 * --Shopping list object
 * --Liked recipes**/

const state = {};

const controlSearch = async () =>{
    //1. get the query from the view
    const query = searchView.getInput() //TODO 
    if (query){
        //2. New search object and add to state
        state.search = new Search(query);

        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();


        //4. Search for recipes
        await state.search.getResults();

        //5. render results on UI
        searchView.renderResults(state.search.result);
        console.log(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault(); //stop the page from reloading when got click on
    controlSearch();

});

