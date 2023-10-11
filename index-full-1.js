//** File: app.js

"use strict;"

//** ===========================================================================

const A0 = {
	viewport: null,
	viewport_width: 0,
	pages_container: null,
	nr_pages: 0,
	lst_pages: null,
	current_page_idx: 0,
	previous_page_idx: 0,
	client_onResize: null,
	client_onClick: null,
	mouse_or_touch: null,
	PAGE_FREE: 0,
	PAGE_LANDSCAPE: 1,
	PAGE_PORTRAIT: -1,
	page_before_rotate: -1,
	page_mode: 0,
	page_rotate_id: 0,
	error_node: null,
	error_page: null
};

A0.Init = function ( onResize, onClick ) {
	
	this.viewport = document.getElementById( "AppViewport" );
	this.pages_container = document.getElementById( "AppPagesContainer" );
	this.lst_pages = Array.from( document.querySelectorAll( ".AppPage" ) );
	this.nr_pages = this.lst_pages.length;
	
	
	if ( window.hasOwnProperty( "cordova" ) ) {
		this.mouse_or_touch = "mousedown";
	} else {
		this.mouse_or_touch = (
			window.ontouchstart !== undefined
			? "touchstart"
			: "mousedown"
		);
	}
	
	A0.onResize( null );
	
	this.client_onResize = onResize || null;
	this.client_onClick = onClick || null;
	
	window.visualViewport.addEventListener( "resize", A0.onResize.bind( this ) );
};

A0.onResize = function ( evt ) {
	// 
	
	this.viewport_width = this.viewport.offsetWidth;
	this.viewport.style.height = window.visualViewport.height + "px";
	
	this.pages_container.style.width = ( this.nr_pages * this.viewport_width ) + "px";
	
	this.pages_container.style.left = (
		- this.current_page_idx * this.viewport.offsetWidth
	) + "px";
	
	this.lst_pages.forEach(
		page => page.style.width = this.viewport_width + "px"
	);

	this.ShowCurrentPage();
	this.TestPageMode();
	
	if ( this.client_onResize !== null ) {
		this.client_onResize( this.viewport_width, this.viewport.offsetHeight );
	}
};

A0.GetWidth = function () {
	return this.viewport_width;
};

A0.GetHeight = function () {
	return this.viewport.offsetHeight;
};

A0.ShowPage = function ( n = "" ) {
	// 
	
	if ( typeof n === "string" ) {
		var idx = 0, pg_id = n, found = false;
		n = this.current_page_idx;
		while ( idx < this.nr_pages ) {
			if ( this.lst_pages[ idx ].id === pg_id ) {
				n = idx;
				found = true;
				break;
			}
			idx ++;
		}
		// 
		if ( ! found ) {
			
			return this.current_page_idx;
		}
	}

	this.pages_container.style.left = ( - n * this.viewport.offsetWidth ) + "px";

	this.previous_page_idx = this.current_page_idx;
	this.current_page_idx = n;

	return n;
};

A0.GetCurrentPage = function () {
	return this.current_page_idx;
};

A0.GetCurrentPageId = function () {
	return this.lst_pages[ this.current_page_idx ].id;
};

A0.ShowCurrentPage = function () {
	this.ShowPage( this.current_page_idx );
};

A0.ShowPreviousPage = function () {
	this.ShowPage( this.current_page_idx );
};

A0.SetPageMode = function ( page_mode, page_rotate_id ) {
	this.page_mode = page_mode;
	this.page_rotate_id = page_rotate_id;
	this.TestPageMode();
};

A0.TestPageMode = function () {
	this.show_page = false;

	if ( this.page_mode !== this.PAGE_FREE ) {
		const status = Math.sign(
			this.viewport.offsetWidth - this.viewport.offsetHeight
		);
		if ( status !== this.page_mode ) {
			if ( this.page_before_rotate === -1 ) {
				this.page_before_rotate = this.current_page_idx;
			}
			this.ShowPage( this.page_rotate_id );
			this.show_page = true;
		} else {
			if ( this.page_before_rotate !== -1 ) {
				this.ShowPage( this.page_before_rotate );
				this.page_before_rotate = -1;
				this.show_page = true;
			}
		}
	}

	if ( ! this.show_page ) {
		this.ShowCurrentPage();
	}

	return this.show_page;
};

//** ===========================================================================

A0.AddClickEventListener = function ( evt_target, js_entity ) {
	evt_target.addEventListener( 
		this.mouse_or_touch,
		this.onClick.bind( this, js_entity )
	);
	
	evt_target.addEventListener(
		"contextmenu",
		this.onContextMenu.bind( this )
	);
};

A0.AddEventListener = function ( element, event_name, handler ) {
	if ( event_name === "MOUSE||TOUCH" ) {
		event_name = this.mouse_or_touch;
	}
	
	if ( event_name === "mousedown" ) {
		element.addEventListener( "contextmenu", this.onContextMenu.bind( this ) );
	}

	element.addEventListener( event_name, handler );
};

A0.ConsumeEvent = function ( evt ) {
	evt.stopPropagation();
	evt.preventDefault();
	return evt.target;
}

A0.onClick = function ( js_entity, evt ) {
	// 
	this.ConsumeEvent( evt );
	if ( this.client_onClick !== null ) {
		this.client_onClick( js_entity, evt.target );
	}
};

A0.onContextMenu = function ( evt ) {
	//  
	this.ConsumeEvent( evt );
	evt.target.click();
};

//** ===========================================================================

A0.RegisterServiceWorker = function ( sw_file ) {
	if (
		"serviceWorker" in navigator
		&& window.location.protocol === "https:"
		&& window.cordova === undefined
	) {
		if ( this.A1 && ! this.A1.Touch() ) {
			return;
		}
		navigator.serviceWorker.register( sw_file )
		.then(
			( reg ) => {
				
			}
		).catch(
			( error ) => {
				
			}
		);
	};
};

//** ===========================================================================

A0.SetErrorHandlers = function ( node = "AppError" ) {
	if ( typeof node === "string" ) {
		node = document.getElementById( node );
	}

	this.error_node = node;
	this.error_page = GetParentNodeByTag( node, "section" );
	
	//** Unhandled promise rejections
	window.addEventListener(
		"unhandledrejection",
		( evt ) => {
			evt.preventDefault();
			this.ShowError( "Unhandled rejection", evt.reason );
			
		}
	);
		
	//** Errors
	window.addEventListener(
		"error",
		 evt => {
			evt.preventDefault();
			const str = [
				evt.error.message,
				evt.error.fileName,
				evt.error.lineNumber,
				this.ProcessStackTrace( evt.error )
			].join( "<br>" );
			this.ShowError( "Error", str );
			
		 }
	);
};

A0.ProcessStackTrace = function ( error ) {
	return error.stack.split( " at " ).join( "<br>&bull; " );
};

A0.ShowError = function ( title, txt ) {
	this.error_node.innerHTML += "<h3>" + title + "</h3>" + txt;
	if ( this.error_page !== null ) {
		this.ShowPage( this.error_page.id );
	}
};

//** ===========================================================================
//** EOF//** File: c_FlexBoxEntity.js

"use strict;"

class FlexBoxEntity {
	
	#id = null;
	#top = Infinity;
	#left = Infinity;
	#width = Infinity;
	#height = Infinity;
	#element = null;

	constructor ( id, make_element = false ) {
		this.#id = id;
		
		if ( make_element === true ) {
			this.#element = this.#MakeElement();
		} else if ( make_element instanceof Node ) {
			this.#element = make_element;
			this.#element.id = this.#id;
			this.#element.classList.add( "FlexBoxEntity" );
		}
	}

	#MakeElement () {
		const element = document.createElement( "div" );
		element.id = this.#id;
		element.classList.add( "FlexBoxEntity" );

		return element;
	}

	GetId () {
		return this.#id;
	}

	GetPosition () {
		return [ this.#top, this.#left ];
	}

	GetElement () {
		return this.#element;
	}

	GetWidth () {
		return this.#width;
	}
	
	GetHeight () {
		return this.#height;
	}
	
	GetTop () {
		return this.#top;
	}
	
	GetLeft () {
		return this.#left;
	}
	
	onResize ( width, height, top, left ) {
		this.SetPosition( top, left );
		this.SetSize( width, height );
	}
	
	SetPosition ( top, left ) {
		this.#top = top;
		this.#left = left;
		
		if ( this.#element !== null ) {
			this.#element.style.top = top + "px";
			this.#element.style.left = left + "px";
		}
	}
	
	SetSize ( width, height ) {
		this.#width = width;
		this.#height = height;

		if ( this.#element !== null ) {
			this.#element.style.width = width + "px";
			this.#element.style.height = height + "px";
		}
	}
}

//** EOF//** File: c_FlexBox.js

"use strict;"

class FlexBox extends FlexBoxEntity {

	#orientation = null;
	#justify = null;
	#align = null;
	#lst_entities = [];
	
	constructor ( id, orientation, justify, align, make_element = false ) {
		super( id, make_element );

		this.#orientation = orientation;
		this.#justify = justify;
		this.#align = align;

		if ( make_element ) {
			this.GetElement().classList.add( "FlexBox" );
		}

	}

	AddEntity ( entity, to_end = true ) {
		this.#lst_entities[ to_end ? "push" : "unshift" ]( entity );
		this.SetEntitiesPosition();
	}
	
	RemoveEntity ( entity ) {
		RemoveArrayElement( this.#lst_entities, entity );
		this.SetEntitiesPosition();
	}

	onResize ( width, height, top, left, e_width = 0, e_height = 0 ) {
		super.onResize( width, height, top, left );
		if ( e_width > 0 && e_height > 0 ) {
			this.SetEntitiesSize( e_width, e_height );
		}
		this.SetEntitiesPosition();
	}

	SetEntitiesSize ( width, height ) {
		if ( this.#lst_entities.length > 0 ) {
			this.#lst_entities.forEach(
				e => e.SetSize( width, height )
			);
		}
	}

	SetEntitiesPosition () {
		if ( this.#lst_entities.length === 0 ) {
			return;
		}

		var entities_width = 0, entities_height = 0;

		this.#lst_entities.forEach(
			e => {
				entities_width += e.GetWidth();
				entities_height += e.GetHeight();
			}
		);

		if ( entities_width === Infinity || entities_height === Infinity ) {
			return;
		}

		var lst_left, lst_top;
		
		if ( this.#orientation === "row" ) {
			lst_left = this.#GetDistributionFunction( this.#justify )( true, "width", entities_width );
			lst_top = this.#GetDistributionFunction( this.#align )( false, "height", entities_height );
		} else {
			lst_top = this.#GetDistributionFunction( this.#justify )( true, "height", entities_height );
			lst_left = this.#GetDistributionFunction( this.#align )( false, "width", entities_width );
		}

		this.#lst_entities.forEach(
			e => {
				e.SetPosition( lst_top.shift(), lst_left.shift() );
			}
		);
	}

	ForEachEntity ( fn ) {
		this.#lst_entities.forEach( e => fn( e ) );
	}

	#GetDistributionFunction ( label ) {
		if ( label === "center" ) {
			return this.#MakeDistributionList_center.bind( this );
		} else if ( label === "start" ) {
			return this.#MakeDistributionList_start.bind( this );
		} else if ( label === "end" ) {
			return this.#MakeDistributionList_end.bind( this );
		} else if ( label === "evenly" ) {
			return this.#MakeDistributionList_evenly.bind( this );
		}
	}

	#PrepareDistribuitonList ( axis, key ) {
		var position = ( key === "width" ? this.GetLeft() : this.GetTop() );
		var idx, e;
		const lst = [];

		for ( idx = 0; idx < this.#lst_entities.length; ++ idx ) {
			if ( axis ) {
				if ( idx > 0 ) {
					e = this.#lst_entities[ idx - 1 ];
					position += ( key === "width" ? e.GetWidth() : e.GetHeight() );
				}
			}
			lst.push( position );
		}

		return lst;
	}

	#MakeDistributionList_start ( axis, key, entities_size ) {
		return this.#PrepareDistribuitonList( axis, key );
	}

	#MakeDistributionList_center ( axis, key, entities_size ) {
		const lst = this.#PrepareDistribuitonList( axis, key );
		const LEN = this.#lst_entities.length;
		const THIS_KEY = ( key === "width" ? this.GetWidth() : this.GetHeight() );
		const step = Math.round( ( THIS_KEY - entities_size ) / 2 );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#lst_entities[ idx ];
				lst[ idx ] += Math.round(
					(
						THIS_KEY
						- 
						( key === "width" ? e.GetWidth() : e.GetHeight() )
					) / 2
				);
			}
		}
				
		return lst;
	}

	#MakeDistributionList_end ( axis, key, entities_size ) {
		const lst = this.#PrepareDistribuitonList( axis, key );
		const LEN = this.#lst_entities.length;
		const THIS_KEY = ( key === "width" ? this.GetWidth() : this.GetHeight() );
		const step = Math.round( THIS_KEY - entities_size );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#lst_entities[ idx ];
				lst[ idx ] += THIS_KEY - ( key === "width" ? e.GetWidth() : e.GetHeight() );
			}
		}

		return lst;
	}
	
	#MakeDistributionList_evenly ( axis, key, entities_size ) {
		const lst = this.#PrepareDistribuitonList( axis, key );
		const LEN = this.#lst_entities.length;
		const THIS_KEY = ( key === "width" ? this.GetWidth() : this.GetHeight() );
		const step = Math.round( ( THIS_KEY - entities_size ) / ( LEN + 1 ) );
	
		for ( var idx = 0; idx < LEN; ++ idx ) {
			lst[ idx ] += ( idx + 1 ) * step;
		}

		return lst;
	}

	ProcessEntities ( fn ) {
		this.#lst_entities = fn( this.#lst_entities );
	}
}

//** EOF
A0.A1 = {
};

A0.A1.Touch = function () {
	return navigator.maxTouchPoints > 0;
};

A0.A1.iOS = function () {
	//** Note: navigator.platform is DEPRECATED
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes( navigator.platform )
	// iPad on iOS 13 detection
	|| ( navigator.userAgent.includes( "Mac" ) && "ontouchend" in document );
};

A0.A1.RequestFullscreen = function () {
	//** Note: requestFullscreen() fails on iOS
	if ( ! document.fullscreenElement && this.Touch() && ! this.iOS() ) {
		if ( document.documentElement.requestFullscreen instanceof Function ) {
			document.documentElement.requestFullscreen( { navigationUI: "hide" } );
		}
	}
};

A0.Storage = {
	prefix: null,
	obj: null
};

A0.Storage.Init = function ( prefix ) {
	this.prefix = prefix;
	this.obj = window.localStorage;
};

A0.Storage.Clear = function () {
	// window.localStorage.clear();
	
};

A0.Storage.RemoveItem = function ( id ) {
	this.obj.removeItem( this.prefix + "_" + id );
};

A0.Storage.SetItemJSON = function ( id, data ) {
	this.obj.setItem( this.prefix + "_" + id, JSON.stringify( data ) );
};

A0.Storage.GetItemJSON = function ( id ) {
	return JSON.parse( this.obj.getItem( this.prefix + "_" + id ) );
};

A0.Storage.PopulateItemJSON = function ( id, values ) {
	
	var data = this.GetItemJSON( id );
	
	
	if ( data === null ) {
		this.SetItemJSON( id, values );
	} else {
		for ( var key in data ) {
			if ( values.hasOwnProperty( key ) ) {
				values[ key ] = data[ key ];
			} else {
				
			}
		};
	}

	return ( data !== null );
};
//** File: tools.js

"use strict;"

function eById ( id_name ) {
	return document.getElementById(id_name);
};

function eByTag ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name)[0];
};

function aByTag ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name);
};

function eByClass (class_name, parent=document) {
	return parent.querySelector(class_name);
};

function aByClass ( class_name, parent=document) {
	return parent.querySelectorAll(class_name);
};

function GetParentNodeByTag ( node, tag ) {
	tag = tag.toUpperCase();
	while ( node !== null && node.tagName !== tag ) {
		node = node.parentNode;
	}
	return node;
};

function Delay ( ms, data = null ) {
	return new Promise(
		( resolve, _ ) => setTimeout( resolve, ms, data )
	);
};

function AppendChildren ( element, lst_children ) {
	lst_children.forEach(
		e => e !== null && element.appendChild( e )
	);
}

function QuerySeachString ( query_key, default_value = null, transform = null, lst_min_max = null ) {
	var query_value = new URL( window.location ).searchParams.get( query_key);
	
	if ( query_value === null ) {
		return default_value;
	}

	function ApplyLimit ( value, lst_min_max ) {
		if ( lst_min_max !== null ) {
			const MIN = lst_min_max[ 0 ];
			const MAX = lst_min_max[ 1 ];
			if ( value < MIN ) {
				value = MIN;
			} else if ( value > MAX ) {
				value = MAX;
			}
		}
		return value;
	}
	
	if ( transform !== null && transform !== "string" ) {
		if ( transform === "int" ) {
			query_value = parseInt( query_value, 10 );
			query_value = ApplyLimit( query_value, lst_min_max );
		} else if ( transform === "float" ) {
			query_value = parseFloat( query_value, 10 );
			query_value = ApplyLimit( query_value, lst_min_max );
		} else if ( transform === "boolean" ) {
			query_value = Boolean( parseInt( query_value, 10 ) );
		} else if ( transform === "uppercase" ) {
			query_value = query_value.toUpperCase();
		} else if ( transform === "lowercase" ) {
			query_value = query_value.toLowerCase();
		}
	}
	
	if ( [ "string", "uppercase", "lowercase" ].includes( transform ) ) {
		if ( lst_min_max !== null ) {
			if ( ! lst_min_max.includes( query_value ) ) {
				return default_value;
			}
		}
	}
	
	return query_value;
};

function GetVarCSS ( var_name, as_int ) {
	const VALUE = getComputedStyle( document.documentElement )
    	.getPropertyValue( "--" + var_name.split( "--" ).pop() )
		.trim();
	return ( as_int ? parseInt( VALUE, 10 ) : VALUE );
};

/**
 * MATH
 */

Math.randomInt = function ( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

Math.randomFloat = function ( min, max ) {
	return min + Math.random() * ( max - min );
};

// Math.GOLDEN_RATIO = ( 1 + Math.sqrt( 5 ) ) / 2;

// Math.HALF_PI = Math.PI / 2;
// Math.TWO_PI = Math.PI * 2;

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function ShuffleArray ( array ) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
	}
}

function CloneArray ( array ) {
	// return array.slice( 0 );
	return array.concat();
}

function RemoveArrayElement ( array, element ) {
	if ( ! array.includes( element ) ) {
		return null;
	}
	return array.splice( array.indexOf( element), 1 ).pop();
}

function RemoveArrayIndex ( array, idx ) {
	if ( idx >= array.length ) {
		return null;
	}
	return array.splice( idx, 1 ).pop();
}

function RemoveRandomElement ( array ) {
	return RemoveArrayIndex( array, Math.randomInt( 0, array.length - 1 ) );
}

function GetRandomElement ( array ) {
	return array[ Math.randomInt( 0, array.length - 1 ) ];
}

//** EOF//** File: c_Card.js

"use strict;"

class Card extends FlexBoxEntity {
	#id = null;
	#suit = -1;
	#value = -1;
	#color = -1;
	#face_up = true;
	#selected = false;
	#show_royals_value = true;
	#location = null;

	#e_body = null;
	#e_face = null;
	#e_back = null;
	#e_value_nr = null;
	#e_value = null;
	#e_suit = null;

	//** suit:	{ id, color, symbol }
	//** value: { nr, symbol }
	constructor ( id, suit, value ) {
		// 
		super( "Card_" + id, true );

		this.#id = id;
		this.#suit = suit.id;
		this.#value = value.nr;
		this.#color = suit.color;
		
		this.MakeBody( value.symbol, value.nr  );
		
		// this.#e_value.appendChild( document.createTextNode(value.symbol) );
		// this.#e_suit.innerHTML = suit.symbol;
		
		if ( this.#suit === SUIT_CLUBS ) {
			this.#e_suit.innerHTML = "<img src='images/triton-head.svg'>";
		} else if ( this.#suit === SUIT_SPADES ) {
			this.#e_suit.innerHTML = "<img src='images/daemon-skull.svg'>";
		} else if ( this.#suit === SUIT_HEARTS ) {
			this.#e_suit.innerHTML = "<img src='images/health-potion.svg'>";
		} else if ( this.#suit === SUIT_DIAMONDS ) {
			this.#e_suit.innerHTML = "<img src='images/sword-spin.svg'>";
		}

		this.#e_value.classList.add( "Suit_" + SUIT_NAMES[ this.#suit ] );
		this.#e_face.classList.add( "Suit_" + SUIT_NAMES[ this.#suit ] );
		
		// this.ShowRoyalsValue( this.#show_royals_value );
	}

	// SetPosition ( top, left ) {
	// 	super.SetPosition( top, left );
	// 	return Delay( CARD_TRANSLATION_TIME, this );
	// }

	GetClickTarget () {
		return this.#e_body;
	}

	// ShowRoyalsValue ( status ) {
	// 	this.#show_royals_value = status;
		
	// 	if ( status && ( this.IsRoyal() || this.IsAce() ) ) {
	// 		this.#e_value_nr.classList.remove( "Hidden" );
	// 	} else {
	// 		this.#e_value_nr.classList.add( "Hidden" );
	// 	}
	// }

	MakeBody ( value_symbol, value_nr ) {
		this.#e_body = document.createElement( "div" );
		this.#e_body.classList.add( "CardBody" );
		this.#e_body.classList.add( "Clickable" );
		
		
		this.#e_face = document.createElement( "div" );
		this.#e_face.classList.add( "CardFace" );
		this.#e_body.appendChild( this.#e_face )
		
		this.#e_back = document.createElement( "div" );
		this.#e_back.classList.add( "CardBack" );
		this.#e_body.appendChild( this.#e_back )

		this.#e_value = document.createElement( "p" );
		this.#e_value.classList.add( "CardValue" );
		this.#e_value.classList.add( "CardValue" + this.#color );
		const SPAN = document.createElement( "span" );
		// SPAN.innerHTML = value_symbol;
		SPAN.innerHTML = value_nr;
		this.#e_value.appendChild( SPAN );
		this.#e_face.appendChild( this.#e_value );

		this.#e_value_nr = document.createElement( "span" );
		// if ( this.IsRoyal() || this.IsAce() ) {
		// 	this.#e_value_nr.innerHTML = value_nr;
		// }
		this.#e_value.appendChild( this.#e_value_nr );
		
		this.#e_suit = document.createElement( "p" );
		this.#e_suit.classList.add( "CardSuit" );
		this.#e_suit.classList.add( "CardSuit" + this.#color );
		this.#e_face.appendChild( this.#e_suit );

		if ( ! this.#face_up ) {
			this.#e_body.classList.add( "FaceDown" );
		}

		// if ( this.IsRoyal() ) {
		// 	this.#e_face.classList.add( "CardRoyal" );
		// } else if ( this.IsJoker() ) {
		// 	this.#e_face.classList.add( "CardJoker" );
		// } else if ( this.IsAce() ) {
		// 	this.#e_face.classList.add( "CardAce" );
		// }

		const ELEMENT = this.GetElement();
		ELEMENT.classList.add( "Card" );
		ELEMENT.classList.add( "CardSmooth" );
		// ELEMENT.classList.add( "CardHidden" );
		ELEMENT.appendChild( this.#e_body );
	}

	GetValue () {
		return this.#value;
	}
	
	GetSuit () {
		return this.#suit;
	}
	
	GetColor () {
		return this.#color;
	}

	SetSize ( width, height ) {
		super.SetSize( width, height );
		// this.#e_body.style.fontSize = Math.round( width * 0.33 ) + "px";
		this.#e_value.style.fontSize = Math.round( width * 0.3 ) + "px";
		if ( this.#e_value.children.length ) {
			this.#e_value.children[ 1 ].style.fontSize = Math.round( width * 0.2 ) + "px";
		}
		this.#e_suit.style.fontSize = Math.round( width * 0.4 ) + "px";
		const img = eByTag( "img", this.#e_suit );
		if ( img !== null ) {
			img.style.width = img.style.height = Math.round( width * 0.75 ) + "px";
		}
	}

	SetFaceUp ( status ) {
		this.#face_up = status;
		this.#e_body.classList[ status ? "remove" : "add" ]( "FaceDown" );
	}
	
	SetSelected ( status ) {
		this.#selected = status;
		this.#e_body.classList[ status ? "add" : "remove" ]( "CardSelected" );
	}
	
	ToggleSelected () {
		this.SetSelected( ! this.#selected );

		return this.#selected;
	}
	
	SetLocation ( entity ) {
		

		this.#location = entity;
	}
	
	IsAt ( entity ) {
		

		return ( this.#location === entity );
	}
	
	GetLocation () {
		return this.#location;
	}
	
	IsRoyal () {
		return [ ROYAL_JACK, ROYAL_QUEEN, ROYAL_KING ].includes( this.#value );
	}

	IsFaceCard () {
		return this.IsRoyal();
	}
	
	IsJoker () {
		return ( this.#value === ROYAL_JOKER );
	}
	
	IsAce () {
		return ( this.#value === ROYAL_ACE );
	}
	
	IsFaceUp () {
		return this.#face_up;
	}
	
	IsSelected () {
		return this.#selected;
	}

	SetHidden ( status ) {
		// 
		this.GetElement().classList[ status ? "add" : "remove" ]( "CardHidden" );
	}
	
	SetSmooth ( status ) {
		this.GetElement().classList[ status ? "add" : "remove" ]( "CardSmooth" );
	}

	SetZindex (value ) {
		this.GetElement().style.zIndex = value;
	}

	IsRoyalOrAce () {
		return ( this.IsRoyal() || this.IsAce() );
	}

	IsRed () {
		return ( this.#suit === SUIT_HEARTS || this.#suit === SUIT_DIAMONDS );
	}

	IsBlack () {
		return ( this.#suit === SUIT_SPADES || this.#suit === SUIT_CLUBS );
	}

	IsHearts () {
		return ( this.#suit === SUIT_HEARTS );
	}
	
	IsDiamonds () {
		return ( this.#suit === SUIT_DIAMONDS );
	}
}

//** EOF//** File: c_CardGame.js

"use strict;"

class CardGame {

	#viewport = null;
	#messenger = null;
	#menu = null;
	#deck = null;
	#busy = false;

	#draw = null;
	#card_piles = null;
	#dungeon = null;
	#discard = null;
	#hand = null;
	#stats = null;

	#can_heal = true;
	#last_run = -1;
	#round = 0;
	#game_over = false;
	
	constructor () {
		this.clicked_card = null; //** DEBUG AID

		A0.Init( this.#onResize.bind( this ), this.#onClick.bind( this) );
		A0.SetErrorHandlers();
		A0.Storage.Init( "scoundrel" );

		this.#InitOptions();
		
		this.#viewport = eById( "GameViewport" );
		this.#messenger = new Messenger( SHOW_TIME );
		this.#menu = new Menu( eById( "MenuPannel" ), eById( "MenuIcon" ) );
		this.#deck = new Deck( NR_JOKERS );

		this.#card_piles = new PilesRow( "CardPiles" );
		this.#draw = this.#card_piles.GetDrawPile();
		this.#discard = this.#card_piles.GetDiscardPile();
		this.#dungeon = new CardsRow( "Dungeon", MAX_ROW_CARDS );
		this.#hand = new CardsRow( "Hand", Infinity );
		this.#stats = new Stats( eById("InGameInfo"), MIN_HEALTH, MAX_HEALTH );
		
		eById( "Play" ).appendChild( this.#messenger.GetElement() );
		this.#viewport.appendChild( this.#dungeon.GetElement() );
		this.#viewport.appendChild( this.#hand.GetElement() );
		AppendChildren( this.#viewport, this.#card_piles.GetElements() );
		
		A0.AddEventListener(
			window, "contextmenu", A0.ConsumeEvent.bind(A0)
		);
		A0.AddClickEventListener(
			eById( "HomeCard" ), null
		);
		A0.AddClickEventListener(
			eById( "MenuIcon" ), null
		);
		this.#menu.GetElements().forEach(
			e => A0.AddClickEventListener( e, null )
		);

		A0.AddClickEventListener(
			this.#draw.GetClickTarget(), this.#draw
		);
		A0.AddClickEventListener(
			this.#discard.GetClickTarget(), this.#discard
		);
		this.#hand.SetClickable( true );
		A0.AddClickEventListener(
			this.#hand.GetClickTarget(), this.#hand
		);

		this.#menu.Hide();
		this.#onResize( 0, 0 );
		this.#InitCards();

		eById( "AppViewport" ).classList.remove( "AppInit" );

		// this.#Debug();
		this.Stats = this.#stats;

		const PAGE = QuerySeachString( "goto", null );
		if ( PAGE !== null ) {
			A0.ShowPage( PAGE );
			this.#menu.ShowIcon( true );
		}
	}

	// #Debug () {
	// 	
	// 	this.Deck = this.#deck;
	// 	this.Draw = this.#draw;
	// 	this.Discard = this.#discard;
	// 	this.Dungeon = this.#dungeon;
	// 	this.Hand = this.#hand;
	// 	// this.start = this.#Start;
	// 	this.Menu = this.#menu;
	// 	this.Messenger = this.#messenger;
	// 	this.Stats = this.#stats;
	// }

	#InitOptions () {
		REDS_MAX = QuerySeachString( "reds_max", REDS_MAX, "int", [ 10, 14 ] );

		Array.from( aByTag( "input", eById( "REDS_MAX" ) ) ).forEach(
			i => {
				if ( parseInt( i.value, 10 ) === REDS_MAX ) {
					i.checked = true;
				}
				i.addEventListener(
					"change",
					evt => {
						window.location = location.href.split( "?" ).shift() + "?goto=Play&reds_max=" + evt.target.value;
					}
				);
			}
		);
	}

	#InitCards () {
		this.#deck.DiscardCards(
			card => {
				return card.IsJoker()
				|| (
					card.GetColor() === COLOR_RED
					&& ( card.GetValue() > REDS_MAX )
				)
			}
		);

		var card;

		while ( ( card = this.#deck.GetCard() ) !== null ) {
			this.#viewport.appendChild( card.GetElement() );
			A0.AddClickEventListener( card.GetClickTarget(), card );
			
			this.#discard.AddCard( card );
		}
	}

	#onResize ( width, height ) {
		const SPACING = this.#viewport.offsetTop;
		const WIDTH = this.#viewport.offsetWidth;

		const CELL_WIDTH = Math.round( WIDTH / 6 );
		const CELL_HEIGHT = Math.round( this.#viewport.offsetHeight / 4 );

		const [ CARD_WIDTH, CARD_HEIGHT ] = this.#CalcCardSize( CELL_WIDTH, CELL_HEIGHT, SPACING );

		this.#deck.SetCardsSize( CARD_WIDTH, CARD_HEIGHT );

		this.#messenger.onResize(
			WIDTH, Math.round( CARD_HEIGHT / 2),
			0, this.#viewport.offsetLeft
		);

		this.#card_piles.onResize(
			WIDTH, CELL_HEIGHT,
			0, 0,
			CARD_WIDTH, CARD_HEIGHT
		);

		this.#dungeon.onResize(
			WIDTH, CELL_HEIGHT,
			CELL_HEIGHT, 0
		);

		this.#hand.onResize(
			WIDTH, CELL_HEIGHT,
			2 * CELL_HEIGHT, 0
		);

		this.#stats.onResize( WIDTH, CELL_HEIGHT - SPACING );
	}

	#CalcCardSize ( cell_width, cell_height, spacing ) {
		const K = 1 * spacing;
		var card_width = cell_width - K;
		var card_height = Math.round( card_width * CARD_ASPECT_RATIO );
		
		if ( card_height > cell_height - K ) {
			card_height = cell_height - K;
			card_width = Math.round( card_height / CARD_ASPECT_RATIO );
		}

		return [ card_width, card_height ];
	}

	#MoveGroupOfCards ( time_factor, nr_cards, fn ) {
		if ( nr_cards === 0 ) {
			return Promise.resolve( null );
		}

		const lst_promises = [];
		const MS = CARD_TRANSLATION_TIME * time_factor;
		var delay = 0;

		

		while ( nr_cards -- > 0 ) {
			lst_promises.push(
				Delay( delay ).then(
					_ => {
						fn();
					}
				)
			);
			delay += MS;
		}
		
		lst_promises.push( Delay( delay - MS + CARD_TRANSLATION_TIME ) );

		return Promise.all( lst_promises );
	}
	
	#DrawCardsToCardRow ( draw_pile, card_row, nr_cards, to_end = true ) {
		

		return this.#MoveGroupOfCards(
			0.5,
			Math.min( nr_cards, draw_pile.GetNrCards() ),
			_ => {
				card_row.AddCard( draw_pile.GetCardFromTop(), to_end );
			}
		);
	}

	#DiscardRemainingCards () {
		this.#deck.ForEachCard( card => card.SetSmooth( false ) );
		
		this.#draw.SendCardsToPile( this.#discard );
		this.#dungeon.ClearCards( this.#discard );
		this.#hand.ClearCards( this.#discard );
		
		setTimeout(
			_ => this.#deck.ForEachCard( card => card.SetSmooth( true ) ),
			0
		);
	}

	#SendCardsToPile ( lst_cards, target_pile ) {
		

		var card;

		while ( lst_cards.length > 0 ) {
			card = lst_cards.pop();
			
			card.GetLocation().RemoveCard( card );
			target_pile.AddCard( card );
		}
	}

	#MakeDrawPile () {
		this.#SendCardsToPile( this.#deck.GetRemainingCards(), this.#draw );
	}

	#Warn ( txt ) {
		this.#messenger.ShowMessage( txt );
	}

	//** ======================================================================

	#onClick ( js_entity, evt_target ) {
		if ( this.#menu.IsIcon( evt_target ) ) {
			return this.#onClickMenuIcon( evt_target.id.split( "_" ).pop() );
		}
		if ( evt_target.id === "HomeCard" ) {
			return this.#onClickMenuIcon( "Play" );
		}

		if ( this.#busy ) {
			
			return;
		}
		if ( this.#game_over ) {
			
			return;
		}

		if ( js_entity instanceof Card ) {
			this.#onClickCard( js_entity );
		} else if ( js_entity instanceof CardPile ) {
			this.#onClickCardPile( js_entity );
		} else if ( js_entity === this.#hand ) {
			this.#onClickHand();
		} else {
			
			if ( js_entity === this.#dungeon ) {
				this._NewDungeon();
			}
		}
	}

	#onClickMenuIcon ( id ) {
		if ( id === "MenuIcon" ) {
			this.#menu.Toggle();
		} else if ( id === "Play" ) {
			if ( A0.GetCurrentPageId() === "Play" ) {
				this.#Start();
			} else {
				this.#menu.ShowIcon( true );
				this.#menu.Show();
				A0.ShowPage( "Play" );
			}
		} else if ( id === "Home" ) {
			this.#menu.Hide();
			this.#menu.ShowIcon( false );
			A0.ShowPage( "Home" );
		} else {
			A0.ShowPage( id );
		}
	}

	#onClickCard ( card ) {
		
		
		this.clicked_card = card; //** DEBUG AID

		if ( this.#busy ) {
			
			return;
		}

		if ( ! card.IsFaceUp() ) {
			this.#onClickCardPile( card.GetLocation() );
		} else if ( card.IsAt( this.#hand ) ) {
			this.#onClickHand();
		} else if ( card.IsBlack() ) {
			this.#onClickMonster( card );
		} else if ( card.IsHearts() ) {
			this.#onClickPotion( card );
		} else {
			this.#onClickWeapon( card );
		}
	}

	#onClickCardPile ( card_pile ) {
		

		if ( this.#busy ) {
			
			return;
		}

		if ( card_pile === this.#discard ) {
			this.#FightBarehanded();
		} else {
			this.#Run();
		}
	}

	#onClickHand () {
		

		const card = this.#dungeon.GetSelectedCard();
		if ( card !== null ) {
			this.#dungeon.UnselectSelectedCard();
			const status = this.#hand.TestAddCard( card );
			if ( status !== 0 ) {
				//** Selected card CANNOT be played into hand
				if ( status === 1 ) {
					this.#Warn( "Hand &raquo; First card must be a weapon." );
				} else if ( status === 2 ) {
					this.#Warn( "Hand &raquo; Card must be a monster." );
				} else if ( status < 0 ) {
					this.#Warn( "Hand &raquo; Monster value must be &lt; " + Math.abs( status ) );
				} else {
					
				}
			} else {
				//** Selected card CAN be played into hand
				this.#RemoveCardFromDungeon( card, this.#hand, false );
				if ( card.IsBlack() ) {
					//** Playing a monster card
					
					const DAMAGE = this.#hand.GetWeaponValue() - card.GetValue();
					if ( DAMAGE < 0 ) {
						if ( this.#stats.UpdateHealth( DAMAGE ) === 0 ) {
							this.#GameOver( false );
						}
					} else {
						this.#stats.ClearHealthUpdates();
					}
				}
				this.#NewRoundIfNeeded();
			}
		} else {
			//** Dungeon has no selected card
			if ( this.#hand.GetNrCards() === 0 ) {
				this.#Warn( "Hand &raquo; Select a weapon from the dungeon." );
			} else {
				this.#Warn( "Hand &raquo; Select a monster from the dungeon." );
			}
		}

		this.#hand._Status();
	}
	
	#onClickMonster ( card ) {
		
		this.#dungeon.SelectCard( card );
		
		if ( this.#hand.GetNrCards() === 0 ) {
			this.#FightBarehanded();
		} else if ( card.GetValue() >= this.#hand.GetMonster() ) {
			this.#FightBarehanded();
		}
	}
	
	#onClickPotion ( card ) {
		

		if ( this.#can_heal ) {
			this.#can_heal = false;
			this.#stats.SetHeal( false );
			this.#stats.UpdateHealth( card.GetValue() );
		} else {
			this.#stats.ClearHealthUpdates();
		}

		this.#RemoveCardFromDungeon( card, this.#discard );
	}
	
	#onClickWeapon ( card ) {
		

		this.#busy = true;

		this.#stats.ClearHealthUpdates();

		this.#MoveGroupOfCards(
			0.33,
			this.#hand.GetNrCards(),
			() => {
				this.#discard.AddCard( this.#hand.RemoveLastCard() );
			}
		).then(
			() => {
				this.#RemoveCardFromDungeon( card, this.#hand );
				this.#busy = false;
				this.#hand._Status();
			}
		);
	}

	#Start () {
		

		if ( this.#busy ) {
			
			return;
		}
		
		this.#busy = true;
		this.#menu.Hide();
		this.#messenger.Hide();
		this.#menu.EnablePlay( false );
		this.#stats.Reset();

		this.#can_heal= true;
		this.#last_run = -1;
		this.#round = 0;
		this.#game_over = false;

		this.#DiscardRemainingCards();

		this.#deck.Reset();
		this.#deck.Shuffle();

		this.#MakeDrawPile();
		

		this.#draw.SetDelay( CARD_TRANSLATION_TIME );
		this.#discard.SetDelay( CARD_TRANSLATION_TIME );

		this.#DrawCardsToCardRow(
			this.#draw, this.#dungeon, MAX_ROW_CARDS, false
		).then(
			() => {
				this.#dungeon.SortCards();
				
				this.#menu.EnablePlay( true );
				this.#busy = false;
			}
		);
	}

	#RemoveCardFromDungeon ( card, target, new_round_if_needed = true  ) {
		
		

		this.#dungeon.RemoveCard( card );
		target.AddCard( card );

		this.#stats.SetRun( false );

		if ( new_round_if_needed ) {
			this.#NewRoundIfNeeded();
		}
	}

	#NewRoundIfNeeded () {
		if ( this.#game_over ) {
			
			return;
		}

		if ( this.#dungeon.GetNrCards() > 1 ) {
			return;
		}

		//** Dungeon cards: 0 || 1

		if ( this.#dungeon.GetNrCards() === 0 ) {
			
			this.#GameOver( true );
			return;
		}

		//** Dungeon cards: 1

		if ( this.#draw.GetNrCards() === 0 ) {
			
			return;
		}

		this.#NewRound();
	}
	
	#NewRound () {
		if ( this.#game_over ) {
			return;
		}

		this.#busy = true;
		this.#round += 1;

		

		this.#can_heal = true;
		this.#stats.SetHeal( true );
		this.#stats.SetRun( this.#round - this.#last_run > 1 );

		this.#DrawCardsToCardRow(
			this.#draw,
			this.#dungeon,
			MAX_ROW_CARDS - this.#dungeon.GetNrCards(),
			false
		).then(
			() => {
				this.#dungeon.SortCards();
				this.#busy = false;
			}
		);
	}

	#FightBarehanded () {
		const card = this.#dungeon.GetSelectedCard();
		if ( card === null ) {
			this.#Warn( "Fight barehanded &raquo; Select a monster from the dungeon." );
		} else {
			this.#RemoveCardFromDungeon( card, this.#discard, false );
			if ( this.#stats.UpdateHealth( - card.GetValue() ) === 0 ) {
				this.#GameOver( false );
			} else {
				this.#NewRoundIfNeeded();
			}
		}
	}

	#Run () {
		if ( this.#last_run >= 0 && this.#round - this.#last_run <= 1 ) {
			this.#Warn( "Run &raquo; No two consecutive rooms can be avoided." );
			return;
		}

		if ( this.#dungeon.GetNrCards() <  MAX_ROW_CARDS ) {
			this.#Warn( "Run &raquo; Not possible after playing cards." );
			return;
		}

		this.#last_run = this.#round;
		this.#stats.SetRun( false );
		this.#busy = true;

		this.#MoveGroupOfCards(
			0.33,
			MAX_ROW_CARDS,
			() => {
				this.#draw.AddCardToBottom( this.#dungeon.RemoveLastCard() );
			}
		).then(
			() => {
				this.#busy = false;
				this.#NewRound();
			}
		);
	}

	#GameOver ( win ) {
		this.#game_over = true;
		var score = 0;
		
		if ( ! win ) {
			this.#draw.GetFilteredCards(
				card => card.IsBlack()
			).forEach(
				card => score -= card.GetValue()
			);
		} else {
			score = this.#stats.GetHealth();

			this.#dungeon.GetFilteredCards(
				card => card.IsHearts()
			).forEach(
				card => score += card.GetValue()
			);
			
			this.#draw.GetFilteredCards(
				card => card.IsHearts()
			).forEach(
				card => score += card.GetValue()
			);
			
		}

		this.#messenger.ShowForever( "Game over &raquo; You scored " + score + "." );

		this.#stats.UpdateHistory( win, score );
	}
}

//** EOF//** File: c_CardPile.js

"use strict;"

class CardPile extends FlexBox {
	#id = null;
	#lst_cards = [];
	#delay = 0;
	#top_card_face = false;
	#base = null;
	#e_counter = null;

	constructor ( id ) {
		super( id, "column", "center", "center", true );

		this.#id = id;

		this.#base = new FlexBoxEntity( this.#id + "_Base", true );
		this.AddEntity( this.#base );

		const E_BASE = this.#base.GetElement();
		E_BASE.classList.add( "CardPileBase" );
		E_BASE.classList.add( "Clickable" );

		this.#e_counter = document.createElement( "p" );
		this.#e_counter.classList.add( "Hidden" );
		E_BASE.appendChild( this.#e_counter );
	}

	GetBaseElement () {
		return this.#base.GetElement();
	}

	GetCards () {
		return CloneArray( this.#lst_cards );
	}

	SetTopCardFace ( status ) {
		this.#top_card_face = status;
		if ( this.#lst_cards.length > 0 ) {
			this.#lst_cards[ this.#lst_cards.length - 1 ].SetFaceUp( status );
		}
	}
	
	// onResize ( width, height, top, left, card_width, card_height ) {
	// 	super.onResize( width, height, top, left );
		
	// }

	UpdateEntities ( card_width, card_height ) {
		//** Base size && position
		this.SetEntitiesSize( card_width, card_height );
		this.SetEntitiesPosition();
		//** Cards position = base position
		this.#SetCardsPosition();
		this.#e_counter.style.fontSize = Math.round( card_width * 0.09 ) + "px";
	}

	#SetCardsPosition () {
		const [ TOP, LEFT ] = this.#base.GetPosition();
		this.#lst_cards.forEach(
			card => card.SetPosition( TOP, LEFT )
		);
	}

	SetCardsIndex () {
		var z = 1;
		this.#lst_cards.forEach(
			card => card.SetZindex( z ++ )
		);
	}

	SetDelay ( value ) {
		this.#delay = value;
	}
	
	AddCardToTop ( card ) {
		this.AddCard( card, true );
	}
	
	AddCardToBottom ( card ) {
		this.AddCard( card, false );
	}
	
	AddCard ( card, to_top = true ) {
		

		if ( this.#lst_cards.includes( card) ) {
			return 
		}

		this.#lst_cards[ to_top ? "push" : "unshift" ]( card );
		this.#e_counter.innerHTML = this.#lst_cards.length;
		
		const [ TOP, LEFT ] = this.#base.GetPosition();
		card.SetSelected( false );
		card.SetFaceUp( false );
		card.SetPosition( TOP, LEFT );
		if ( to_top ) {
			card.SetZindex( 100 + this.#lst_cards.length );
		} else {
			card.SetZindex( 0 );
		}
		card.SetLocation( this );

		Delay( this.#delay ).then(
			_ => {
				this.SetCardsIndex();
				this.HideAllButTopCard();
			}
		);
	}

	GetBasePosition () {
		return this.#base.GetPosition();
	}

	GetCardFromTop () {
		if ( this.#lst_cards.length === 0 ) {
			
			return null;
		}

		const CARD = this.#lst_cards.pop();
		CARD.SetZindex( 100 + this.#lst_cards.length );
		CARD.SetHidden( false );
		this.HideAllButTopCard();
		this.#e_counter.innerHTML = this.#lst_cards.length;

		return CARD;
	}

	HideAllButTopCard () {
		var idx = this.#lst_cards.length - 1;

		if ( idx >= 0 ) {
			//** Top card
			var card = this.#lst_cards[ idx ];
			card.SetHidden( false );
			card.SetFaceUp( this.#top_card_face );

			//** All other cards
			for ( -- idx; idx >= 0; -- idx ) {
				card = this.#lst_cards[ idx ];
				card.SetHidden( true );
				card.SetFaceUp( false );
			}
		}
	}

	// _TopCard() {
	// 	return this.#lst_cards[ this.#lst_cards.length - 1 ];
	// }

	IsEmpty () {
		return ( this.#lst_cards.length === 0 );
	}
	
	GetNrCards () {
		return this.#lst_cards.length;
	}

	RemoveCard ( card ) {
		

		if ( ! this.#lst_cards.includes( card) ) {
			return 
		}

		RemoveArrayElement( this.#lst_cards, card );
		card.SetHidden( false );
		this.#e_counter.innerHTML = this.#lst_cards.length;
		this.HideAllButTopCard();

		return card;
	}

	ShowCounter ( status ) {
		this.#e_counter.classList[ status ? "remove" : "add" ]( "Hidden" );
		if ( status ) {
			this.#e_counter.innerHTML = this.#lst_cards.length;
		}
	}

	SendCardsToPile ( card_pile ) {
		

		var card;
		while ( this.#lst_cards.length > 0 ) {
			card = this.#lst_cards[ 0 ];
			this.RemoveCard( card );
			card_pile.AddCard( card );
		}
	}

	GetClickTarget () {
		return this.#base.GetElement();
	}

	// ClearCards () {
	// 	var lst_cards = [];

	// 	while ( this.#lst_cards.length > 0 ) {
	// 		lst_cards.push( this.GetCardFromTop() );
	// 	}

	// 	return lst_cards;
	// }

	ShuffleCards () {
		if ( this.#lst_cards.length > 1 ) {
			ShuffleArray( this.#lst_cards );
			this.SetCardsIndex();
			this.HideAllButTopCard();
		}
	}

	Highlight ( status ) {
		this.GetElement().classList[ status ? "add" : "remove" ]( "Highlight" );
	}

	GetFilteredCards ( fn ) {
		return this.#lst_cards.filter( fn );
	}

}

//** EOF//** File: c_Hand.js

"use strict;"

class CardsRow extends FlexBox {
	#id = null;
	#max_cards = 0;
	#lst_cards = [];
	#is_hand = false;
	#selected_card = null;
	#weapon = 0;
	#monster = Infinity;
	
	constructor ( id, max_cards ) {
		// super( id, "row", "evenly", "center", true );
		super(
			id,
			"row",
			isNaN( parseInt( max_cards, 10 ) ) ? "center" : "evenly",
			"center",
			true
		);

		this.#id = id;
		this.#max_cards = max_cards;
		this.#is_hand = isNaN( parseInt( max_cards, 10 ) );
	}

	IsHand () {
		return this.#is_hand;
	}

	onResize ( width, height, top, left ) {
		// 
		super.onResize( width, height, top, left );
		// this.SetEntitiesPosition();
	}

	SetClickable ( status ) {
		this.GetElement().classList[ status ? "add" : "remove "]( "Clickable" );
	}
	
	GetClickTarget () {
		return this.GetElement();
	}

	AddCard ( card, to_end = true ) {
		

		if ( this.#lst_cards.length === this.#max_cards ) {
			return 
		}
		if ( this.#lst_cards.includes( card) ) {
			return 
		}

		card.SetLocation( this );
		card.SetFaceUp( true );
		card.SetZindex( 100 + this.#lst_cards.length );

		if ( to_end ) {
			//** Add card to hand
			
			
			if ( card.IsDiamonds() ) {
				this.#weapon = card.GetValue();
			} else if ( card.IsBlack() ) {
				this.#monster = card.GetValue();
			}

			this.#lst_cards.push( card );
		} else {
			//** Add card to dungeon
			
			this.#lst_cards.unshift( card );
		}

		//** Add card to FlexStart/FlexEnd
		this.AddEntity( card, to_end );

		return true;
	}

	RemoveCard ( card ) {
		

		if ( ! this.#lst_cards.includes( card ) ) {
			return 
		}
		
		RemoveArrayElement( this.#lst_cards, card );
		this.RemoveEntity( card );

		if ( card === this.#selected_card ) {
			card.SetSelected( false );
			this.#selected_card = null;
		}

		if ( this.#is_hand && this.#lst_cards.length === 0 ) {
			this.#weapon = 0;
			this.#monster = Infinity;
		}

		return card;
	}

	ClearCards ( card_pile ) {
		
		
		var card;
		while ( this.#lst_cards.length > 0 ) {
			card = this.#lst_cards[ 0 ];
			this.RemoveCard( card );
			card_pile.AddCard( card );
		}

		if ( this.#is_hand ) {
			
			this.#weapon = 0;
			this.#monster = Infinity;
		}
	}

	// GetFilteredCards ( fn ) {
	// 	return this.#lst_cards.filter( fn );
	// }

	SelectCard ( card ) {
		

		if ( this.#selected_card !== null ) {
			this.#selected_card.SetSelected( false );
			if ( this.#selected_card === card ) {
				this.#selected_card = null;
				return;
			}
		}
		
		this.#selected_card = card;
		this.#selected_card.SetSelected( true );
	}

	GetSelectedCard () {
		

		return this.#selected_card;
	}

	UnselectSelectedCard () {
		

		if ( this.#selected_card !== null ) {
			this.#selected_card.SetSelected( false );
			this.#selected_card = null;
		}
	}

	GetNrCards () {
		return this.#lst_cards.length;
	}

	GetCards () {
		return CloneArray( this.#lst_cards );
	}

	_Status () {
		
		
	}

	TestAddCard ( card ) {
		

		if ( this.#lst_cards.length === 0 ) {
			//** First card: must be a weapon
			if ( ! card.IsDiamonds() ) {
				// 
				return 1;
			}
		} else {
			//** Add card to hand: NOT first card, must be a enemy
			
			if ( ! card.IsBlack() ) {
				// 
				return 2;
			} else if ( card.GetValue() >= this.#monster ) {
				// 
				return ( - this.#monster );
			}
		}

		return 0;
	}

	GetMonster () {
		return this.#monster;
	}

	GetWeaponValue () {
		
		
		return this.#weapon;
	}
	
	RemoveLastCard () {
		// 
		
		return this.RemoveCard(
			this.#lst_cards[ this.#lst_cards.length - 1 ]
		);
	}

	SortCards () {
		this.ProcessEntities(
			lst => {
				this.#lst_cards = lst.sort(
					( a, b ) => {
						if ( b.IsRed() || a.IsRed() ) {
							if ( b.IsRed() && ! a.IsRed() ) {
								return 1;
							}
							if ( a.IsRed() && ! b.IsRed() ) {
								return -1;
							}
							if ( b.GetSuit() !== a.GetSuit() ) {
								return Math.sign( b.GetSuit() - a.GetSuit() );
							}
						}
						return Math.sign( b.GetValue() - a.GetValue() );
					}
				);
				return CloneArray( this.#lst_cards );
			}
		);
		this.SetEntitiesPosition();
	}
}

//** EOF//** File: c_Deck.js

"use strict;"

class Deck {
	#lst_cards = [];
	#lst_cards_out = [];
	#nr_jokers = 0;
	#total_cards = 0;
	
	constructor ( nr_jokers ) {
		this.#nr_jokers = nr_jokers;

		this.#MakeCards();
	}

	#MakeCards () {
		var card, id = 0;
		const LST_COLORS = [];
		
		//** Add cards 2 to 14
		var suit, value, color;
		for ( suit = 0; suit < 4; ++ suit ) {
			color = this.GetSuitColor( suit );
			if ( ! LST_COLORS.includes( color ) ) {
				LST_COLORS.push( color );
			}
			for ( value = 2; value <= 14; ++ value ) {
				card = new Card(
					id ++,
					//** suit:	{ id, symbol, color }
					{ id: suit, symbol: this.GetSuitSymbol( suit ), color: color },
					//** value: { nr, symbol }
					{ nr: value, symbol: this.GetValueSymbol( value ) }
					);
					this.#lst_cards.push( card );
					this.#total_cards += 1;
					// 
			}
		}
			
		//** Add JOKERS
		var idx_color = 0, n;
		for ( n = 1; n <= this.#nr_jokers; ++ n ) {
			card = new Card(
				id ++,
				//** suit:	{ id, symbol, color }
				{ id: SUIT_JOKER, symbol: this.GetSuitSymbol( SUIT_JOKER ), color: LST_COLORS[ idx_color ] },
				//** value: { nr, symbol }
				{ nr: ROYAL_JOKER, symbol: this.GetValueSymbol( ROYAL_JOKER ) }
			);
			
			this.#lst_cards.push( card );
			this.#total_cards += 1;

			idx_color = ( 1 + idx_color ) % LST_COLORS.length;
		}
	}

	DiscardCards ( fn ) {
		if ( this.#lst_cards_out.length > 0 ) {
			
			return;
		}

		const lst_cards = this.#lst_cards.filter( fn );

		

		this.#total_cards -= lst_cards.length;
		
		lst_cards.forEach(
			card => {
				RemoveArrayElement( this.#lst_cards, card );
			}
		)

		

		return lst_cards;
	}

	onResize ( card_width, card_height ) {
		this.ForEachCard( card => card.SetSize( card_width, card_height ) );
	}

	ForEachCard ( fn ) {
		this.#lst_cards.forEach( fn );
		this.#lst_cards_out.forEach( fn );
	}

	Shuffle () {
		ShuffleArray( this.#lst_cards );
	}

	GetCard () {
		if ( this.#lst_cards.length === 0 ) {
			return null;
		}

		const CARD = RemoveRandomElement( this.#lst_cards );
		this.#lst_cards_out.push( CARD );
		
		return CARD;
	}

	Reset () {
		while ( this.#lst_cards_out.length ) {
			this.#lst_cards.push( this.#lst_cards_out.pop() );
		}

		
	}

	GetSuitSymbol ( suit ) {
		return LST_SUITS.filter( data => data.id === suit ).pop().symbol;
	}
	
	GetSuitColor ( suit ) {
		return LST_SUITS.filter( data => data.id === suit ).pop().color;
	}
	
	GetValueSymbol ( value ) {
		if ( value === ROYAL_JOKER || 11 <= value && value <= 13 || value === ROYAL_ACE ) {
			return LST_ROYALS.filter( data => data.value === value ).pop().symbol;
		}
		return value;
	}

	SetCardsSize ( card_width, card_height ) {
		this.ForEachCard(
			card => card.SetSize( card_width, card_height )
		);
	}

	GetFilteredCards ( fn ) {
		const lst_cards = this.#lst_cards.filter( fn );
		
		lst_cards.forEach(
			card => {
				RemoveArrayElement( this.#lst_cards, card );
				this.#lst_cards_out.push( card );
			}
		)

		return lst_cards;
	}

	GetNrCards () {
		return this.#lst_cards.length;
	}

	GetNrTotalCards () {
		return this.#total_cards;
	}

	GetRemainingCards () {
		const lst_cards = [];
		var card;

		while ( this.#lst_cards.length > 0 ) {
			var card = this.#lst_cards.pop();
			this.#lst_cards_out.push( card );
			lst_cards.push( card );
		}

		return lst_cards;
	}
	
	// AllCardsMatch ( lst_cards, fn ) {
	// 	var ok = true;

	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( ! fn( card ) ) {
	// 				ok = false;
	// 			}
	// 		}
	// 	);

	// 	return ok;
	// }

	// AnyCardMatches ( lst_cards, fn ) {
	// 	var ok = false;

	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( fn( card ) ) {
	// 				ok = true;
	// 			}
	// 		}
	// 	);

	// 	return ok;
	// }

	// GetSequenceValue ( lst_cards, sequence_suit = null ) {
	// 	if ( lst_cards.length === 0 ) {
	// 		return NaN;
	// 	}

	// 	if ( sequence_suit === null ) {
	// 		sequence_suit = this.GetSequenceSuit( lst_cards );
	// 	}
	// 	// 
	// 	if ( sequence_suit === null ) {
	// 		return NaN;
	// 	}

	// 	var nr_jokers = 0, sum_value = 0, max_value = 0;
		
	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( card.IsJoker() ) {
	// 				nr_jokers += 1;
	// 			} else {
	// 				let card_value = card.GetValue();
	// 				sum_value += card_value;
	// 				if ( card_value > max_value ) {
	// 					max_value = card_value;
	// 				}
	// 			}
	// 		}
	// 	);

	// 	if ( nr_jokers > 0 ) {
	// 		sum_value += nr_jokers * max_value;
	// 	}

	// 	// 

	// 	return sum_value;
	// }

	// GetSequenceSuit ( lst_cards ) {
	// 	if ( lst_cards.length === 0 ) {
	// 		return null;
	// 	}

	// 	var suit = null, ok = true;

	// 	lst_cards.forEach(
	// 		card => {
	// 			if ( ! card.IsJoker() ) {
	// 				if ( suit === null ) {
	// 					suit = card.GetSuit();
	// 				}
	// 				if ( suit !== null && card.GetSuit() !== suit ) {
	// 					ok = false;
	// 				}
	// 			}
	// 		}
	// 	);

	// 	return ( ok ? suit : null );
	// }

}

//** EOF//** File: c_Menu.js

class Menu {
    #element = null;
    #icon = null;
	#lst_elements =null;

    constructor  ( element, icon ) {
        this.#element = element;
        this.#icon = icon;

		this.#lst_elements = Array.from( element.children );
		
		this.#icon.classList.add( "Clickable" );

		this.#lst_elements.forEach(
			e => e.classList.add( "Clickable" )
		);
    }

	GetElements () {
		return CloneArray( this.#lst_elements );
	}

    Show () {
		this.#element.style.right = 0;
	}
    
	Hide () {
		this.#element.style.right = ( -1.1 * this.#element.offsetWidth ) + "px"
	}
    
	Toggle () {
		// 
		this.#element.style.right === "0px"
			? this.Hide()
			: this.Show();
	}

	ShowIcon ( status = true ) {
		this.#icon.classList[ status ? "remove" : "add" ]( "Hidden" );
	}

	IsIcon( e ) {
		return e.id.startsWith( "Menu" );
	}
	
	EnablePlay ( status ) {
		eById( "Menu_Play" ).classList[ status ? "remove" : "add" ]( "Hidden" );
	}

}

//** EOF//** File: c_Messenger.js

"use strict;"

class Messenger {
	#element = null;
	#txt = null;
	#show_time = 0;
	#timer = 0;
	
	constructor ( show_time ) {
		this.#element = document.createElement( "div" );
		this.#element.id = "Messenger";
		this.#txt = document.createElement( "p" );
		this.#element.appendChild( this.#txt );

		this.#show_time = ( show_time < 1E3 ? 1E3 * show_time : show_time );
	}

	// SetShowTime ( value ) {
	// 	this.#show_time = value;
	// }

	GetElement () {
		return this.#element;
	}

	onResize ( width, height, top, left ) {
		this.#element.style.width = width + "px";
		this.#element.style.height = height + "px";
		this.#element.style.left = left + "px";
		
		this.#txt.style.fontSize = Math.min(
			Math.round( height * 0.25 ),
			17
		) + "px";

		this.Hide();
	}

	Hide () {
		this.#element.style.top = ( - 1.1 * this.#element.offsetHeight ) + "px";
	}
	
	ShowPrefixMessage ( prefix, message ) {
		if ( this.#show_time > 0 ) {
			this.ShowMessage( "<span>" + prefix + "</span>: " + message );
		}
	}

	ShowMessage ( message ) {
		if ( this.#show_time > 0 ) {
			clearTimeout( this.#timer );
			this.#timer = setTimeout( this.Hide.bind( this ), this.#show_time );
			this.#txt.innerHTML = message;
			this.#element.style.top = 0;
		}
	}
	
	ShowForever ( message ) {
		clearTimeout( this.timer );
		this.#txt.innerHTML = message;
		this.#element.style.top = 0;
	}

}

//** EOF//** File: c_PilesRow.js

"use strict;"

class PilesRow extends FlexBox {
	#id = null;
	#draw = null;
	#discard = null;
	
	//** id === "Dungeon" || "Hand"
	constructor ( id ) {
		super( "PilesRow_" + id, "row", "evenly", "center", true );

		this.#id = id;
		this.#draw = new CardPile( id + "_Draw" );
		this.#discard = new CardPile( id + "_Discard" );

		this.#discard.ShowCounter( true );
		this.#draw.ShowCounter( true );

		this.AddEntity( this.#draw );
		this.AddEntity( this.#discard );
	}

	onResize ( width, height, top, left, card_width, card_height ) {
		super.onResize( width, height, top, left );
		
		//** Entities: draw && discard piles
		this.SetEntitiesSize( Math.min( Math.round( width / 3 ), height), height );
		this.SetEntitiesPosition();

		this.ForEachEntity(
			e => {
				if ( e instanceof CardPile ) {
					e.UpdateEntities( card_width, card_height );
				} else {
					
					e.GetElement().style.fontSize = Math.round( card_width * 0.12 ) + "px";
				}
			}
		);
	}

	GetDrawPile () {
		return this.#draw;
	}

	GetDiscardPile () {
		return this.#discard;
	}

	GetElements () {
		return [
			this.GetElement(),
			this.#draw.GetElement(),
			this.#discard.GetElement(),
			this.#draw.GetBaseElement(),
			this.#discard.GetBaseElement()
		];
	}

}

//** EOF//** File: c_Stats.js

class Stats {
    #element = null;

    #health = 0;
    #e_health = null;
    #e_health_left = null;
    #e_health_right = null;
    #e_health_update = null;
	#MIN_HEALTH = 0;
	#MAX_HEALTH = 0;
    #txt_health = null;
    #txt_run = null;
    #txt_heal = null;
    #display_health = 0;
    #DELAY = 100;

    // #games_finished = 0;
    // #games_won = 0;
    // #lst_last_scores = [];
    // #lst_best_scores = [];
    #LST_MAX = 10;
    #KEY = "stats";

    #data = {
        games_finished: 0,
        games_won: 0,
        lst_last_scores: [],
        lst_best_scores: []
    }

    constructor  ( element, min_health, max_health ) {
        this.#element = element;
        this.#MIN_HEALTH = min_health;
        this.#MAX_HEALTH = max_health

        element.appendChild( this.#e_health_left = this.#MakeGauge( "HealthLeft" ) );
        this.#e_health = document.createElement( "div" );
        this.#e_health.id = "Health";
        element.appendChild( this.#e_health );
        element.appendChild( this.#e_health_right = this.#MakeGauge( "HealthRight" ) );
        this.#txt_health = document.createElement( "div" );
        this.#txt_health.innerHTML = "--";
        this.#e_health.appendChild( this.#txt_health );
        this.#e_health_update = document.createElement( "div" );
        this.#e_health.appendChild( this.#e_health_update );
        const div = document.createElement( "div" );
        this.#e_health.appendChild( div );
        this.#txt_run = document.createElement( "span" );
        // this.#txt_run.innerHTML = "&larr;";
        // this.#txt_run.innerHTML = "&#x25C0;";
        this.#txt_run.innerHTML = "R";
        this.#txt_heal = document.createElement( "span" );
        // this.#txt_heal.innerHTML = "&uarr;";
        // this.#txt_heal.innerHTML = "&#x25B2;";
        this.#txt_heal.innerHTML = "H";
        div.appendChild( this.#txt_run );
        div.appendChild( this.#txt_heal );

        [ "latest", "best" ].forEach(
            key => {
                var e = eById( "lst_" + key + "_scores" );
                var i, p;
                for ( i = 0 ; i < this.#LST_MAX; ++ i ) {
                    p = document.createElement( "p" );
                    e.appendChild( p );
                    p.id= key + "_" + i;
                }
            }
        );

        this.#InitStorage();
        
    }

    Reset () {
        this.#health = this.#display_health = this.#MAX_HEALTH;
        this.#e_health_update.innerHTML = "";
        
        this.SetHeal( true );
        this.SetRun( true );
        this.#UpdateInfo();
    }
    
    ClearHealthUpdates () {
        this.#e_health_update.innerHTML = "";
    }

    #MakeGauge ( id ) {
        const div = document.createElement( "div" );
        div.id = id;
        const e = document.createElement( "div" );
        div.appendChild( e );
		return div;
	}

    onResize ( width, height ) {
        this.#element.style.height = height + "px";
        const FS1 = Math.round( width * 0.4 * 0.09 );
        this.#e_health_left.style.fontSize = FS1 + "px";
        this.#e_health_right.style.fontSize = FS1 + "px";
	}

    UpdateHealth ( value ) {
        

        this.#health += value;
        this.#e_health_update.innerHTML = ( value > 0 ? "+" : "" ) + value;
        
        if ( this.#health > this.#MAX_HEALTH ) {
            this.#health = this.#MAX_HEALTH;
        } else if ( this.#health < this.#MIN_HEALTH ) {
            this.#health = this.#MIN_HEALTH;
        }

        if ( this.#display_health !== this.#health ) {
            setTimeout(
                this.#StepHealth.bind( this ),
                this.#DELAY
            );
        }

        return this.#health;
    }

    #StepHealth = function () {
        this.#display_health += Math.sign( this.#health - this.#display_health );
        this.#UpdateInfo();

        if ( this.#display_health !== this.#health ) {
            setTimeout( this.#StepHealth.bind( this ), this.#DELAY );
        }
    }
    
    #UpdateInfo () {
        this.#txt_health.innerHTML = this.#display_health;
        const W = Math.floor( 100 * ( this.#display_health / this.#MAX_HEALTH ) );
        eByTag( "div", this.#e_health_left ).style.width = W + "%";
        eByTag( "div", this.#e_health_right ).style.width = W + "%";
    }

    SetRun ( status ) {
        this.#txt_run.classList[ status ? "remove" : "add" ]( "Disabled" );
    }

    SetHeal ( status ) {
        this.#txt_heal.classList[ status ? "remove" : "add" ]( "Disabled" );
    }

    GetHealth () {
        return this.#health;
    }

    UpdateHistory ( win, score ) {
        this.#data.games_finished += 1;
        // eById( "txt_stats_finished" ).innerHTML = this.#data.games_finished;
        
        if ( win ) {
            this.#data.games_won += 1;
            // eById( "txt_stats_won" ).innerHTML = this.#data.games_won;
        }

        // eById( "txt_stats_winratio" ).innerHTML = Math.round( this.#data.games_won / this.#data.games_finished * 100 );


        this.#data.lst_last_scores.unshift( score) ;
        this.#data.lst_last_scores = this.#data.lst_last_scores.splice( 0, this.#LST_MAX );
        // this.#UpdateScoreList( "latest", this.#data.lst_last_scores, score );

        this.#data.lst_best_scores.push( score) ;
        this.#data.lst_best_scores.sort(  ( x, y ) => y - x );
        this.#data.lst_best_scores = this.#data.lst_best_scores.splice( 0, this.#LST_MAX );
        // this.#UpdateScoreList( "best", this.#data.lst_best_scores, score );

        
        
        
        
        
        

        this.#UpdateStorage();

        this.#UpdateStatsInfo( score );
    }

    #UpdateScoreList ( key, lst_v, score ) {
        var lst_e = eById( "lst_" + key + "_scores" ).children;
        var found = false;

        for ( var i = 0; i < lst_v.length; i++ ) {
            lst_e[ i ].innerHTML = lst_v[ i ];
            if ( score !== Infinity && ! found && lst_v[ i ] === score ) {
                found = true;
                lst_e[ i ].classList.add( "current" );
            } else {
                lst_e[ i ].classList.remove( "current" );
            }
        }
    }

    #MakeStorageData () {
        var data = {}, key;
        
        for ( key in this.#data ) {
            data[ key ] = this.#data[ key ];
        }
        
        return data;
    }

    #UpdateStorage () {
        A0.Storage.SetItemJSON( this.#KEY, this.#MakeStorageData() );
    }

    #UpdateFromStorage ( storage_data ) {
        for ( var key in storage_data ) {
            if ( this.#data.hasOwnProperty( key ) ) {
                this.#data[ key ] = storage_data[ key ];
            } else {
                
            }
        }
    }

    #InitStorage () {
        var data = this.#MakeStorageData();

        if ( A0.Storage.PopulateItemJSON( this.#KEY, data ) ) {
            this.#UpdateFromStorage( data );
        }

        this.#UpdateStatsInfo( Infinity );
    }

    #UpdateStatsInfo ( score ) {
        eById( "txt_stats_finished" ).innerHTML = this.#data.games_finished;
        eById( "txt_stats_won" ).innerHTML = this.#data.games_won;
        if ( this.#data.games_finished > 0 ) {
            eById( "txt_stats_winratio" ).innerHTML = Math.round( this.#data.games_won / this.#data.games_finished * 100 ) + "%";
        } else {
            eById( "txt_stats_winratio" ).innerHTML = "0%";
        }

        this.#UpdateScoreList( "latest", this.#data.lst_last_scores, score );
        this.#UpdateScoreList( "best", this.#data.lst_best_scores, score );
    }

}

//** EOF//** File: const.js

"use strict;"

//** Safe to change

const CARD_ASPECT_RATIO = 16 / 11;

//** Options

var REDS_MAX = 10;
const SHOW_TIME = 5;
const NR_JOKERS = 0;

//**

const CARD_TRANSLATION_TIME = GetVarCSS( "CARD_TRANSLATE_TIME", true );

const MAX_ROW_CARDS = 4;
const MAX_HEALTH = 20;
const MIN_HEALTH = 0;

//** Card values, suits and symbols

const SUIT_HEARTS = 0;
const SUIT_SPADES = 1;
const SUIT_DIAMONDS = 2;
const SUIT_CLUBS = 3;
const SUIT_JOKER = 4;
const SUIT_NAMES =  [ "hearts", "spades", "diamonds", "clubs", "joker" ];

const ROYAL_JOKER = 0;
const ROYAL_JACK = 11;
const ROYAL_QUEEN = 12;
const ROYAL_KING = 13;
const ROYAL_ACE = 14;

const COLOR_RED = "Red";
const COLOR_BLACK = "Black";

const LST_SUITS = [
	{ id: SUIT_HEARTS,		symbol: "&hearts;",	color: COLOR_RED },
	{ id: SUIT_SPADES,		symbol: "&spades;",	color: COLOR_BLACK },
	{ id: SUIT_DIAMONDS,	symbol: "&diams;",	color: COLOR_RED },
	{ id: SUIT_CLUBS,		symbol: "&clubs;",	color: COLOR_BLACK },
	{ id: SUIT_JOKER,		symbol: "",	color: "" }
];

const LST_ROYALS = [
	{ value: ROYAL_JACK, symbol: "J" },
	{ value: ROYAL_QUEEN, symbol: "Q" },
	{ value: ROYAL_KING, symbol: "K" },
	{ value: ROYAL_ACE, symbol: "A" },
	{ value: ROYAL_JOKER, symbol: "&#x2605;" }
];

//** EOF//** File: main-dist.js

"use strict;"

window.addEventListener(
	"load",
	() => {
		new CardGame();
	}
);

//** EOF