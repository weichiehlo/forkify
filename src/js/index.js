import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import {elements, renderLoader, clearLoader} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

/**Global state of the app
 * --Search object
 * --Current recipe object
 * --Shopping list object
 * --Liked recipes**/


/**
 * Search Controller
 */
const controlSearch = async () =>{
    //1. get the query from the view
    const query = searchView.getInput() //TODO 
    
    if (query){
        //2. New search object and add to state
        state.search = new Search(query);

        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchRes);

        try{

            //4. Search for recipes
            await state.search.getResults();
            
            //5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result, 1, 10);
        }
        catch(error){
            clearLoader();
            alert(`Error getting search info ${error}`);
        }

    }
}


elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault(); //stop the page from reloading when got click on
    controlSearch();

});


elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline')
    if(btn){
        // const goToPage = btn.getAttribute('data-goto');
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResults(state.search.result, goToPage);
    }
    
})

/**
 * Recipe Controller
 */
const controlRecipe = async () =>{
    //Get ID for url
    const id = window.location.hash.slice(1);
    if (id){
        
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search){
            searchView.highlightSelected(id);
        }
        

        //Create new object
        state.recipe = new Recipe(id);        

        try{
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate servings and time

            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            
            clearLoader();
            recipeView.renderRecipe(
                state.recipe, 
                state.likes.isLiked(id));
        }
        catch(error){
            alert(`Error Processing Recipe: ${error}`);
        }
        
    }

}

['hashchange', 'load'].forEach(e =>window.addEventListener(e, controlRecipe));

/**List Controller */
const controlList = () =>{
    // Create a new list if there is none yet
    if(!state.list){
        state.list = new List();
    }
    //Add each ingredient in the list and user interface)
    state.recipe.ingredients.forEach(el =>{
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        
        listView.renderItem(item);
    });
}

//handle delete and update list item event
elements.shopping.addEventListener('click', e =>{
    // const id = e.target.closest('.shopping__item').dataset.item-id;
    const id = e.target.closest('.shopping__item').getAttribute('data-item-id')

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);
    } else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }



})

/**
 * Like Controller
 */



const controlLike = () => {
    if(!state.likes){
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;

    //User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        //Add Like to the state
        const newLike = state.likes.addLike(
            currentID, 
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true)

        //Add like to the UI List
        likesView.renderLike(newLike);

    //User has liked current recipe
    } else{
        //Remove Like to the state
        state.likes.deleteLike(currentID)

        //Toggle the like button
        likesView.toggleLikeBtn(false)

        //Remove like to the UI List
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())
}

//Restore like recipe on page load
window.addEventListener('load', () =>{
    state.likes = new Likes();

    // Restore Likes
    state.likes.readStorage();

    // Toggle like menu button 
    likesView.toggleLikeMenu(state.likes.getNumLikes())

    // Render like menu

    state.likes.likes.forEach(likesView.renderLike);
});

//Handling recipe button clicks
elements.recipe.addEventListener('click',e=>{
    
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')){
        // increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *' )){
        //Add ingredient to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});

