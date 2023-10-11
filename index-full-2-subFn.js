
"use strict;"

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

A0.f28 = /* Init */ function ( onResize, onClick ) {
	
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
	
	A0.f22( null );
	
	this.client_onResize = onResize || null;
	this.client_onClick = onClick || null;
	
	window.visualViewport.addEventListener( "resize", A0.f22.bind( this ) );
};

A0.f22 = /* onResize */ function ( evt ) {
	
	this.viewport_width = this.viewport.offsetWidth;
	this.viewport.style.height = window.visualViewport.height + "px";
	
	this.pages_container.style.width = ( this.nr_pages * this.viewport_width ) + "px";
	
	this.pages_container.style.left = (
		- this.current_page_idx * this.viewport.offsetWidth
	) + "px";
	
	this.lst_pages.forEach(
		page => page.style.width = this.viewport_width + "px"
	);

	this.f9();
	this.f12();
	
	if ( this.client_onResize !== null ) {
		this.client_onResize( this.viewport_width, this.viewport.offsetHeight );
	}
};

A0.f23 = /* GetWidth */ function () {
	return this.viewport_width;
};

A0.f19 = /* GetHeight */ function () {
	return this.viewport.offsetHeight;
};

A0.f24 = /* ShowPage */ function ( n = "" ) {
	
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
		if ( ! found ) {
			
			return this.current_page_idx;
		}
	}

	this.pages_container.style.left = ( - n * this.viewport.offsetWidth ) + "px";

	this.previous_page_idx = this.current_page_idx;
	this.current_page_idx = n;

	return n;
};

A0.f10 = /* GetCurrentPage */ function () {
	return this.current_page_idx;
};

A0.f4 = /* GetCurrentPageId */ function () {
	return this.lst_pages[ this.current_page_idx ].id;
};

A0.f9 = /* ShowCurrentPage */ function () {
	this.f24( this.current_page_idx );
};

A0.f5 = /* ShowPreviousPage */ function () {
	this.f24( this.current_page_idx );
};

A0.f14 = /* SetPageMode */ function ( page_mode, page_rotate_id ) {
	this.page_mode = page_mode;
	this.page_rotate_id = page_rotate_id;
	this.f12();
};

A0.f12 = /* TestPageMode */ function () {
	this.show_page = false;

	if ( this.page_mode !== this.PAGE_FREE ) {
		const status = Math.sign(
			this.viewport.offsetWidth - this.viewport.offsetHeight
		);
		if ( status !== this.page_mode ) {
			if ( this.page_before_rotate === -1 ) {
				this.page_before_rotate = this.current_page_idx;
			}
			this.f24( this.page_rotate_id );
			this.show_page = true;
		} else {
			if ( this.page_before_rotate !== -1 ) {
				this.f24( this.page_before_rotate );
				this.page_before_rotate = -1;
				this.show_page = true;
			}
		}
	}

	if ( ! this.show_page ) {
		this.f9();
	}

	return this.show_page;
};

A0.f0 = /* AddClickEventListener */ function ( evt_target, js_entity ) {
	evt_target.addEventListener( 
		this.mouse_or_touch,
		this.f25.bind( this, js_entity )
	);
	
	evt_target.addEventListener(
		"contextmenu",
		this.f11.bind( this )
	);
};

A0.f6 = /* AddEventListener */ function ( element, event_name, handler ) {
	if ( event_name === "MOUSE||TOUCH" ) {
		event_name = this.mouse_or_touch;
	}
	
	if ( event_name === "mousedown" ) {
		element.addEventListener( "contextmenu", this.f11.bind( this ) );
	}

	element.addEventListener( event_name, handler );
};

A0.f13 = /* ConsumeEvent */ function ( evt ) {
	evt.stopPropagation();
	evt.preventDefault();
	return evt.target;
}

A0.f25 = /* onClick */ function ( js_entity, evt ) {
	this.f13( evt );
	if ( this.client_onClick !== null ) {
		this.client_onClick( js_entity, evt.target );
	}
};

A0.f11 = /* onContextMenu */ function ( evt ) {
	this.f13( evt );
	evt.target.click();
};

A0.f1 = /* RegisterServiceWorker */ function ( sw_file ) {
	if (
		"serviceWorker" in navigator
		&& window.location.protocol === "https:"
		&& window.cordova === undefined
	) {
		if ( this.A1 && ! this.A1.f26() ) {
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

A0.f7 = /* SetErrorHandlers */ function ( node = "AppError" ) {
	if ( typeof node === "string" ) {
		node = document.getElementById( node );
	}

	this.error_node = node;
	this.error_page = g1( node, "section" );
	window.addEventListener(
		"unhandledrejection",
		( evt ) => {
			evt.preventDefault();
			this.f20( "Unhandled rejection", evt.reason );
			
		}
	);
	window.addEventListener(
		"error",
		 evt => {
			evt.preventDefault();
			const str = [
				evt.error.message,
				evt.error.fileName,
				evt.error.lineNumber,
				this.f2( evt.error )
			].join( "<br>" );
			this.f20( "Error", str );
			
		 }
	);
};

A0.f2 = /* ProcessStackTrace */ function ( error ) {
	return error.stack.split( " at " ).join( "<br>&bull; " );
};

A0.f20 = /* ShowError */ function ( title, txt ) {
	this.error_node.innerHTML += "<h3>" + title + "</h3>" + txt;
	if ( this.error_page !== null ) {
		this.f24( this.error_page.id );
	}
};

"use strict;"

/* FlexBoxEntity */
class C0 {
	
/* #id */ #p70 = null;
/* #top */ #p67 = Infinity;
/* #left */ #p57 = Infinity;
/* #width */ #p48 = Infinity;
/* #height */ #p41 = Infinity;
/* #element */ #p31 = null;

	constructor ( id, make_element = false ) {
		this.#p70 = id;
		
		if ( make_element === true ) {
			this.#p31 = this.#P26();
		} else if ( make_element instanceof Node ) {
			this.#p31 = make_element;
			this.#p31.id = this.#p70;
			this.#p31.classList.add( "FlexBoxEntity" );
		}
	}

/* #MakeElement */ #P26 () {
		const element = document.createElement( "div" );
		element.id = this.#p70;
		element.classList.add( "FlexBoxEntity" );

		return element;
	}

/* GetId */ M90 () {
		return this.#p70;
	}

/* GetPosition */ M37 () {
		return [ this.#p67, this.#p57 ];
	}

/* GetElement */ M49 () {
		return this.#p31;
	}

/* GetWidth */ f23 () {
		return this.#p48;
	}
	
/* GetHeight */ f19 () {
		return this.#p41;
	}
	
/* GetTop */ M86 () {
		return this.#p67;
	}
	
/* GetLeft */ M75 () {
		return this.#p57;
	}
	
/* onResize */ f22 ( width, height, top, left ) {
		this.M38( top, left );
		this.M76( width, height );
	}
	
/* SetPosition */ M38 ( top, left ) {
		this.#p67 = top;
		this.#p57 = left;
		
		if ( this.#p31 !== null ) {
			this.#p31.style.top = top + "px";
			this.#p31.style.left = left + "px";
		}
	}
	
/* SetSize */ M76 ( width, height ) {
		this.#p48 = width;
		this.#p41 = height;

		if ( this.#p31 !== null ) {
			this.#p31.style.width = width + "px";
			this.#p31.style.height = height + "px";
		}
	}
}

"use strict;"

/* FlexBox */
class E3 extends C0 {

/* #orientation */ #p9 = null;
/* #justify */ #p32 = null;
/* #align */ #p49 = null;
/* #lst_entities */ #p8 = [];
	
	constructor ( id, orientation, justify, align, make_element = false ) {
		super( id, make_element );

		this.#p9 = orientation;
		this.#p32 = justify;
		this.#p49 = align;

		if ( make_element ) {
			this.M49().classList.add( "FlexBox" );
		}

	}

/* AddEntity */ M59 ( entity, to_end = true ) {
		this.#p8[ to_end ? "push" : "unshift" ]( entity );
		this.M1();
	}
	
/* RemoveEntity */ M28 ( entity ) {
 g2( this.#p8, entity );
		this.M1();
	}

/* onResize */ f22 ( width, height, top, left, e_width = 0, e_height = 0 ) {
		super.f22( width, height, top, left );
		if ( e_width > 0 && e_height > 0 ) {
			this.M7( e_width, e_height );
		}
		this.M1();
	}

/* SetEntitiesSize */ M7 ( width, height ) {
		if ( this.#p8.length > 0 ) {
			this.#p8.forEach(
				e => e.M76( width, height )
			);
		}
	}

/* SetEntitiesPosition */ M1 () {
		if ( this.#p8.length === 0 ) {
			return;
		}

		var entities_width = 0, entities_height = 0;

		this.#p8.forEach(
			e => {
				entities_width += e.f23();
				entities_height += e.f19();
			}
		);

		if ( entities_width === Infinity || entities_height === Infinity ) {
			return;
		}

		var lst_left, lst_top;
		
		if ( this.#p9 === "row" ) {
			lst_left = this.#P4( this.#p32 )( true, "width", entities_width );
			lst_top = this.#P4( this.#p49 )( false, "height", entities_height );
		} else {
			lst_top = this.#P4( this.#p32 )( true, "height", entities_height );
			lst_left = this.#P4( this.#p49 )( false, "width", entities_width );
		}

		this.#p8.forEach(
			e => {
				e.M38( lst_top.shift(), lst_left.shift() );
			}
		);
	}

/* ForEachEntity */ M24 ( fn ) {
		this.#p8.forEach( e => fn( e ) );
	}

/* #GetDistributionFunction */ #P4 ( label ) {
		if ( label === "center" ) {
			return this.#P0.bind( this );
		} else if ( label === "start" ) {
			return this.#P2.bind( this );
		} else if ( label === "end" ) {
			return this.#P3.bind( this );
		} else if ( label === "evenly" ) {
			return this.#P1.bind( this );
		}
	}

/* #PrepareDistribuitonList */ #P5 ( axis, key ) {
		var position = ( key === "width" ? this.M75() : this.M86() );
		var idx, e;
		const lst = [];

		for ( idx = 0; idx < this.#p8.length; ++ idx ) {
			if ( axis ) {
				if ( idx > 0 ) {
					e = this.#p8[ idx - 1 ];
					position += ( key === "width" ? e.f23() : e.f19() );
				}
			}
			lst.push( position );
		}

		return lst;
	}

/* #MakeDistributionList_start */ #P2 ( axis, key, entities_size ) {
		return this.#P5( axis, key );
	}

/* #MakeDistributionList_center */ #P0 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p8.length;
		const THIS_KEY = ( key === "width" ? this.f23() : this.f19() );
		const step = Math.round( ( THIS_KEY - entities_size ) / 2 );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#p8[ idx ];
				lst[ idx ] += Math.round(
					(
						THIS_KEY
						- 
						( key === "width" ? e.f23() : e.f19() )
					) / 2
				);
			}
		}
				
		return lst;
	}

/* #MakeDistributionList_end */ #P3 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p8.length;
		const THIS_KEY = ( key === "width" ? this.f23() : this.f19() );
		const step = Math.round( THIS_KEY - entities_size );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#p8[ idx ];
				lst[ idx ] += THIS_KEY - ( key === "width" ? e.f23() : e.f19() );
			}
		}

		return lst;
	}
	
/* #MakeDistributionList_evenly */ #P1 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p8.length;
		const THIS_KEY = ( key === "width" ? this.f23() : this.f19() );
		const step = Math.round( ( THIS_KEY - entities_size ) / ( LEN + 1 ) );
	
		for ( var idx = 0; idx < LEN; ++ idx ) {
			lst[ idx ] += ( idx + 1 ) * step;
		}

		return lst;
	}

/* ProcessEntities */ M8 ( fn ) {
		this.#p8 = fn( this.#p8 );
	}
}
A0.A1 = {
};

A0.A1.f26 = /* Touch */ function () {
	return navigator.maxTouchPoints > 0;
};

A0.A1.f29 = /* iOS */ function () {
	return [
		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'
	].includes( navigator.platform )
	|| ( navigator.userAgent.includes( "Mac" ) && "ontouchend" in document );
};

A0.A1.f3 = /* RequestFullscreen */ function () {
	if ( ! document.fullscreenElement && this.f26() && ! this.f29() ) {
		if ( document.documentElement.requestFullscreen instanceof Function ) {
			document.documentElement.requestFullscreen( { navigationUI: "hide" } );
		}
	}
};

A0.Storage = {
	prefix: null,
	obj: null
};

A0.Storage.f28 = /* Init */ function ( prefix ) {
	this.prefix = prefix;
	this.obj = window.localStorage;
};

A0.Storage.f27 = /* Clear */ function () {
	
};

A0.Storage.f18 = /* RemoveItem */ function ( id ) {
	this.obj.removeItem( this.prefix + "_" + id );
};

A0.Storage.f15 = /* SetItemJSON */ function ( id, data ) {
	this.obj.setItem( this.prefix + "_" + id, JSON.stringify( data ) );
};

A0.Storage.f16 = /* GetItemJSON */ function ( id ) {
	return JSON.parse( this.obj.getItem( this.prefix + "_" + id ) );
};

A0.Storage.f8 = /* PopulateItemJSON */ function ( id, values ) {
	
	var data = this.f16( id );
	
	
	if ( data === null ) {
		this.f15( id, values );
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

"use strict;"

/* eById */ function g14 ( id_name ) {
	return document.getElementById(id_name);
};

/* eByTag */ function g12 ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name)[0];
};

/* aByTag */ function g13 ( tag_name, parent) {
	if (! parent) parent = document;
	return parent.getElementsByTagName(tag_name);
};

/* eByClass */ function g10 (class_name, parent=document) {
	return parent.querySelector(class_name);
};

/* aByClass */ function g11 ( class_name, parent=document) {
	return parent.querySelectorAll(class_name);
};

/* GetParentNodeByTag */ function g1 ( node, tag ) {
	tag = tag.toUpperCase();
	while ( node !== null && node.tagName !== tag ) {
		node = node.parentNode;
	}
	return node;
};

/* Delay */ function g15 ( ms, data = null ) {
	return new Promise(
		( resolve, _ ) => setTimeout( resolve, ms, data )
	);
};

/* AppendChildren */ function g6 ( element, lst_children ) {
	lst_children.forEach(
		e => e !== null && element.appendChild( e )
	);
}

/* QuerySeachString */ function g3 ( query_key, default_value = null, transform = null, lst_min_max = null ) {
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

/* GetVarCSS */ function g9 ( var_name, as_int ) {
	const VALUE = getComputedStyle( document.documentElement )
    	.getPropertyValue( "--" + var_name.split( "--" ).pop() )
		.trim();
	return ( as_int ? parseInt( VALUE, 10 ) : VALUE );
};

Math.f21 = /* randomInt */ function ( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

Math.f17 = /* randomFloat */ function ( min, max ) {
	return min + Math.random() * ( max - min );
};
/* ShuffleArray */ function g7 ( array ) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
	}
}

/* CloneArray */ function g8 ( array ) {
	return array.concat();
}

/* RemoveArrayElement */ function g2 ( array, element ) {
	if ( ! array.includes( element ) ) {
		return null;
	}
	return array.splice( array.indexOf( element), 1 ).pop();
}

/* RemoveArrayIndex */ function g4 ( array, idx ) {
	if ( idx >= array.length ) {
		return null;
	}
	return array.splice( idx, 1 ).pop();
}

/* RemoveRandomElement */ function g0 ( array ) {
	return g4( array, Math.f21( 0, array.length - 1 ) );
}

/* GetRandomElement */ function g5 ( array ) {
	return array[ Math.f21( 0, array.length - 1 ) ];
}

"use strict;"

/* Card */
class E4 extends C0 {
/* #id */ #p70 = null;
/* #suit */ #p58 = -1;
/* #value */ #p50 = -1;
/* #color */ #p51 = -1;
/* #face_up */ #p33 = true;
/* #selected */ #p24 = false;
/* #show_royals_value */ #p0 = true;
/* #location */ #p25 = null;

/* #e_body */ #p42 = null;
/* #e_face */ #p43 = null;
/* #e_back */ #p44 = null;
/* #e_value_nr */ #p11 = null;
/* #e_value */ #p34 = null;
/* #e_suit */ #p45 = null;
	constructor ( id, suit, value ) {
		super( "Card_" + id, true );

		this.#p70 = id;
		this.#p58 = suit.id;
		this.#p50 = value.nr;
		this.#p51 = suit.color;
		
		this.M67( value.symbol, value.nr  );
		
		if ( this.#p58 === k11 ) {
			this.#p45.innerHTML = "<img src='images/triton-head.svg'>";
		} else if ( this.#p58 === k5 ) {
			this.#p45.innerHTML = "<img src='images/daemon-skull.svg'>";
		} else if ( this.#p58 === k4 ) {
			this.#p45.innerHTML = "<img src='images/health-potion.svg'>";
		} else if ( this.#p58 === k3 ) {
			this.#p45.innerHTML = "<img src='images/sword-spin.svg'>";
		}

		this.#p34.classList.add( "Suit_" + k13[ this.#p58 ] );
		this.#p43.classList.add( "Suit_" + k13[ this.#p58 ] );
	}

/* GetClickTarget */ M14 () {
		return this.#p42;
	}

/* MakeBody */ M67 ( value_symbol, value_nr ) {
		this.#p42 = document.createElement( "div" );
		this.#p42.classList.add( "CardBody" );
		this.#p42.classList.add( "Clickable" );
		
		
		this.#p43 = document.createElement( "div" );
		this.#p43.classList.add( "CardFace" );
		this.#p42.appendChild( this.#p43 )
		
		this.#p44 = document.createElement( "div" );
		this.#p44.classList.add( "CardBack" );
		this.#p42.appendChild( this.#p44 )

		this.#p34 = document.createElement( "p" );
		this.#p34.classList.add( "CardValue" );
		this.#p34.classList.add( "CardValue" + this.#p51 );
		const SPAN = document.createElement( "span" );
		SPAN.innerHTML = value_nr;
		this.#p34.appendChild( SPAN );
		this.#p43.appendChild( this.#p34 );

		this.#p11 = document.createElement( "span" );
		this.#p34.appendChild( this.#p11 );
		
		this.#p45 = document.createElement( "p" );
		this.#p45.classList.add( "CardSuit" );
		this.#p45.classList.add( "CardSuit" + this.#p51 );
		this.#p43.appendChild( this.#p45 );

		if ( ! this.#p33 ) {
			this.#p42.classList.add( "FaceDown" );
		}

		const ELEMENT = this.M49();
		ELEMENT.classList.add( "Card" );
		ELEMENT.classList.add( "CardSmooth" );
		ELEMENT.appendChild( this.#p42 );
	}

/* GetValue */ M68 () {
		return this.#p50;
	}
	
/* GetSuit */ M77 () {
		return this.#p58;
	}
	
/* GetColor */ M69 () {
		return this.#p51;
	}

/* SetSize */ M76 ( width, height ) {
		super.M76( width, height );
		this.#p34.style.fontSize = Math.round( width * 0.3 ) + "px";
		if ( this.#p34.children.length ) {
			this.#p34.children[ 1 ].style.fontSize = Math.round( width * 0.2 ) + "px";
		}
		this.#p45.style.fontSize = Math.round( width * 0.4 ) + "px";
		const img = g12( "img", this.#p45 );
		if ( img !== null ) {
			img.style.width = img.style.height = Math.round( width * 0.75 ) + "px";
		}
	}

/* SetFaceUp */ M60 ( status ) {
		this.#p33 = status;
		this.#p42.classList[ status ? "remove" : "add" ]( "FaceDown" );
	}
	
/* SetSelected */ M39 ( status ) {
		this.#p24 = status;
		this.#p42.classList[ status ? "add" : "remove" ]( "CardSelected" );
	}
	
/* ToggleSelected */ M15 () {
		this.M39( ! this.#p24 );

		return this.#p24;
	}
	
/* SetLocation */ M40 ( entity ) {
		

		this.#p25 = entity;
	}
	
/* IsAt */ M94 ( entity ) {
		

		return ( this.#p25 === entity );
	}
	
/* GetLocation */ M41 () {
		return this.#p25;
	}
	
/* IsRoyal */ M78 () {
		return [ k14, k7, k15 ].includes( this.#p50 );
	}

/* IsFaceCard */ M50 () {
		return this.M78();
	}
	
/* IsJoker */ M79 () {
		return ( this.#p50 === k6 );
	}
	
/* IsAce */ M91 () {
		return ( this.#p50 === k19 );
	}
	
/* IsFaceUp */ M70 () {
		return this.#p33;
	}
	
/* IsSelected */ M51 () {
		return this.#p24;
	}

/* SetHidden */ M61 ( status ) {
		this.M49().classList[ status ? "add" : "remove" ]( "CardHidden" );
	}
	
/* SetSmooth */ M62 ( status ) {
		this.M49().classList[ status ? "add" : "remove" ]( "CardSmooth" );
	}

/* SetZindex */ M63 (value ) {
		this.M49().style.zIndex = value;
	}

/* IsRoyalOrAce */ M29 () {
		return ( this.M78() || this.M91() );
	}

/* IsRed */ M92 () {
		return ( this.#p58 === k4 || this.#p58 === k3 );
	}

/* IsBlack */ M80 () {
		return ( this.#p58 === k5 || this.#p58 === k11 );
	}

/* IsHearts */ M71 () {
		return ( this.#p58 === k4 );
	}
	
/* IsDiamonds */ M52 () {
		return ( this.#p58 === k3 );
	}
}

"use strict;"

/* CardGame */
class C2 {

/* #viewport */ #p26 = null;
/* #messenger */ #p17 = null;
/* #menu */ #p59 = null;
/* #deck */ #p60 = null;
/* #busy */ #p61 = false;

/* #draw */ #p62 = null;
/* #card_piles */ #p12 = null;
/* #dungeon */ #p35 = null;
/* #discard */ #p36 = null;
/* #hand */ #p63 = null;
/* #stats */ #p52 = null;

/* #can_heal */ #p27 = true;
/* #last_run */ #p28 = -1;
/* #round */ #p53 = 0;
/* #game_over */ #p18 = false;
	
	constructor () {
		this.clicked_card = null; 

		A0.f28( this.#P35.bind( this ), this.#P38.bind( this) );
		A0.f7();
		A0.Storage.f28( "scoundrel" );

		this.#P27();
		
		this.#p26 = g14( "GameViewport" );
		this.#p17 = new C1( k17 );
		this.#p59 = new C5( g14( "MenuPannel" ), g14( "MenuIcon" ) );
		this.#p60 = new C4( k18 );

		this.#p12 = new E2( "CardPiles" );
		this.#p62 = this.#p12.M48();
		this.#p36 = this.#p12.M23();
		this.#p35 = new E1( "Dungeon", k2 );
		this.#p63 = new E1( "Hand", Infinity );
		this.#p52 = new C3( g14("InGameInfo"), k10, k9 );
		
 g14( "Play" ).appendChild( this.#p17.M49() );
		this.#p26.appendChild( this.#p35.M49() );
		this.#p26.appendChild( this.#p63.M49() );
 g6( this.#p26, this.#p12.M45() );
		
		A0.f6(
			window, "contextmenu", A0.f13.bind(A0)
		);
		A0.f0(
 g14( "HomeCard" ), null
		);
		A0.f0(
 g14( "MenuIcon" ), null
		);
		this.#p59.M45().forEach(
			e => A0.f0( e, null )
		);

		A0.f0(
			this.#p62.M14(), this.#p62
		);
		A0.f0(
			this.#p36.M14(), this.#p36
		);
		this.#p63.M32( true );
		A0.f0(
			this.#p63.M14(), this.#p63
		);

		this.#p59.M96();
		this.#P35( 0, 0 );
		this.#P32();

 g14( "AppViewport" ).classList.remove( "AppInit" );
		this.Stats = this.#p52;

		const PAGE = g3( "goto", null );
		if ( PAGE !== null ) {
			A0.f24( PAGE );
			this.#p59.M74( true );
		}
	}

/* #InitOptions */ #P27 () {
		REDS_MAX = g3( "reds_max", REDS_MAX, "int", [ 10, 14 ] );

		Array.from( g13( "input", g14( "REDS_MAX" ) ) ).forEach(
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

/* #InitCards */ #P32 () {
		this.#p60.M33(
			card => {
				return card.M79()
				|| (
					card.M69() === k20
					&& ( card.M68() > REDS_MAX )
				)
			}
		);

		var card;

		while ( ( card = this.#p60.M84() ) !== null ) {
			this.#p26.appendChild( card.M49() );
			A0.f0( card.M14(), card );
			
			this.#p36.M81( card );
		}
	}

/* #onResize */ #P35 ( width, height ) {
		const SPACING = this.#p26.offsetTop;
		const WIDTH = this.#p26.offsetWidth;

		const CELL_WIDTH = Math.round( WIDTH / 6 );
		const CELL_HEIGHT = Math.round( this.#p26.offsetHeight / 4 );

		const [ CARD_WIDTH, CARD_HEIGHT ] = this.#P24( CELL_WIDTH, CELL_HEIGHT, SPACING );

		this.#p60.M35( CARD_WIDTH, CARD_HEIGHT );

		this.#p17.f22(
			WIDTH, Math.round( CARD_HEIGHT / 2),
			0, this.#p26.offsetLeft
		);

		this.#p12.f22(
			WIDTH, CELL_HEIGHT,
			0, 0,
			CARD_WIDTH, CARD_HEIGHT
		);

		this.#p35.f22(
			WIDTH, CELL_HEIGHT,
			CELL_HEIGHT, 0
		);

		this.#p63.f22(
			WIDTH, CELL_HEIGHT,
			2 * CELL_HEIGHT, 0
		);

		this.#p52.f22( WIDTH, CELL_HEIGHT - SPACING );
	}

/* #CalcCardSize */ #P24 ( cell_width, cell_height, spacing ) {
		const K = 1 * spacing;
		var card_width = cell_width - K;
		var card_height = Math.round( card_width * k1 );
		
		if ( card_height > cell_height - K ) {
			card_height = cell_height - K;
			card_width = Math.round( card_height / k1 );
		}

		return [ card_width, card_height ];
	}

/* #MoveGroupOfCards */ #P10 ( time_factor, nr_cards, fn ) {
		if ( nr_cards === 0 ) {
			return Promise.resolve( null );
		}

		const lst_promises = [];
		const MS = k0 * time_factor;
		var delay = 0;

		

		while ( nr_cards -- > 0 ) {
			lst_promises.push(
 g15( delay ).then(
					_ => {
						fn();
					}
				)
			);
			delay += MS;
		}
		
		lst_promises.push( g15( delay - MS + k0 ) );

		return Promise.all( lst_promises );
	}
	
/* #DrawCardsToCardRow */ #P8 ( draw_pile, card_row, nr_cards, to_end = true ) {
		

		return this.#P10(
			0.5,
			Math.min( nr_cards, draw_pile.M53() ),
			_ => {
				card_row.M81( draw_pile.M19(), to_end );
			}
		);
	}

/* #DiscardRemainingCards */ #P6 () {
		this.#p60.M44( card => card.M62( false ) );
		
		this.#p62.M11( this.#p36 );
		this.#p35.M55( this.#p36 );
		this.#p63.M55( this.#p36 );
		
		setTimeout(
			_ => this.#p60.M44( card => card.M62( true ) ),
			0
		);
	}

/* #SendCardsToPile */ #P13 ( lst_cards, target_pile ) {
		

		var card;

		while ( lst_cards.length > 0 ) {
			card = lst_cards.pop();
			
			card.M41().M54( card );
			target_pile.M81( card );
		}
	}

/* #MakeDrawPile */ #P25 () {
		this.#P13( this.#p60.M4(), this.#p62 );
	}

/* #Warn */ #P40 ( txt ) {
		this.#p17.M46( txt );
	}

/* #onClick */ #P38 ( js_entity, evt_target ) {
		if ( this.#p59.IsIcon( evt_target ) ) {
			return this.#P14( evt_target.id.split( "_" ).pop() );
		}
		if ( evt_target.id === "HomeCard" ) {
			return this.#P14( "Play" );
		}

		if ( this.#p61 ) {
			
			return;
		}
		if ( this.#p18 ) {
			
			return;
		}

		if ( js_entity instanceof E4 ) {
			this.#P28( js_entity );
		} else if ( js_entity instanceof E0 ) {
			this.#P15( js_entity );
		} else if ( js_entity === this.#p63 ) {
			this.#P29();
		} else {
			
			if ( js_entity === this.#p35 ) {
				this._NewDungeon();
			}
		}
	}

/* #onClickMenuIcon */ #P14 ( id ) {
		if ( id === "MenuIcon" ) {
			this.#p59.M88();
		} else if ( id === "Play" ) {
			if ( A0.f4() === "Play" ) {
				this.#P39();
			} else {
				this.#p59.M74( true );
				this.#p59.M95();
				A0.f24( "Play" );
			}
		} else if ( id === "Home" ) {
			this.#p59.M96();
			this.#p59.M74( false );
			A0.f24( "Home" );
		} else {
			A0.f24( id );
		}
	}

/* #onClickCard */ #P28 ( card ) {
		
		
		this.clicked_card = card; 

		if ( this.#p61 ) {
			
			return;
		}

		if ( ! card.M70() ) {
			this.#P15( card.M41() );
		} else if ( card.M94( this.#p63 ) ) {
			this.#P29();
		} else if ( card.M80() ) {
			this.#P20( card );
		} else if ( card.M71() ) {
			this.#P21( card );
		} else {
			this.#P22( card );
		}
	}

/* #onClickCardPile */ #P15 ( card_pile ) {
		

		if ( this.#p61 ) {
			
			return;
		}

		if ( card_pile === this.#p36 ) {
			this.#P16();
		} else {
			this.#P41();
		}
	}

/* #onClickHand */ #P29 () {
		

		const card = this.#p35.M12();
		if ( card !== null ) {
			this.#p35.M0();
			const status = this.#p63.M43( card );
			if ( status !== 0 ) {
				if ( status === 1 ) {
					this.#P40( "Hand &raquo; First card must be a weapon." );
				} else if ( status === 2 ) {
					this.#P40( "Hand &raquo; Card must be a monster." );
				} else if ( status < 0 ) {
					this.#P40( "Hand &raquo; Monster value must be &lt; " + Math.abs( status ) );
				} else {
					
				}
			} else {
				this.#P7( card, this.#p63, false );
				if ( card.M80() ) {
					
					const DAMAGE = this.#p63.M20() - card.M68();
					if ( DAMAGE < 0 ) {
						if ( this.#p52.M36( DAMAGE ) === 0 ) {
							this.#P37( false );
						}
					} else {
						this.#p52.M2();
					}
				}
				this.#P11();
			}
		} else {
			if ( this.#p63.M53() === 0 ) {
				this.#P40( "Hand &raquo; Select a weapon from the dungeon." );
			} else {
				this.#P40( "Hand &raquo; Select a monster from the dungeon." );
			}
		}

		this.#p63._Status();
	}
	
/* #onClickMonster */ #P20 ( card ) {
		
		this.#p35.M56( card );
		
		if ( this.#p63.M53() === 0 ) {
			this.#P16();
		} else if ( card.M68() >= this.#p63.M57() ) {
			this.#P16();
		}
	}
	
/* #onClickPotion */ #P21 ( card ) {
		

		if ( this.#p27 ) {
			this.#p27 = false;
			this.#p52.M85( false );
			this.#p52.M36( card.M68() );
		} else {
			this.#p52.M2();
		}

		this.#P7( card, this.#p36 );
	}
	
/* #onClickWeapon */ #P22 ( card ) {
		

		this.#p61 = true;

		this.#p52.M2();

		this.#P10(
			0.33,
			this.#p63.M53(),
			() => {
				this.#p36.M81( this.#p63.M21() );
			}
		).then(
			() => {
				this.#P7( card, this.#p63 );
				this.#p61 = false;
				this.#p63._Status();
			}
		);
	}

/* #Start */ #P39 () {
		

		if ( this.#p61 ) {
			
			return;
		}
		
		this.#p61 = true;
		this.#p59.M96();
		this.#p17.M96();
		this.#p59.M58( false );
		this.#p52.M93();

		this.#p27= true;
		this.#p28 = -1;
		this.#p53 = 0;
		this.#p18 = false;

		this.#P6();

		this.#p60.M93();
		this.#p60.M83();

		this.#P25();
		

		this.#p62.M73( k0 );
		this.#p36.M73( k0 );

		this.#P8(
			this.#p62, this.#p35, k2, false
		).then(
			() => {
				this.#p35.M65();
				
				this.#p59.M58( true );
				this.#p61 = false;
			}
		);
	}

/* #RemoveCardFromDungeon */ #P7 ( card, target, new_round_if_needed = true  ) {
		
		

		this.#p35.M54( card );
		target.M81( card );

		this.#p52.M89( false );

		if ( new_round_if_needed ) {
			this.#P11();
		}
	}

/* #NewRoundIfNeeded */ #P11 () {
		if ( this.#p18 ) {
			
			return;
		}

		if ( this.#p35.M53() > 1 ) {
			return;
		}

		if ( this.#p35.M53() === 0 ) {
			
			this.#P37( true );
			return;
		}

		if ( this.#p62.M53() === 0 ) {
			
			return;
		}

		this.#P36();
	}
	
/* #NewRound */ #P36 () {
		if ( this.#p18 ) {
			return;
		}

		this.#p61 = true;
		this.#p53 += 1;

		

		this.#p27 = true;
		this.#p52.M85( true );
		this.#p52.M89( this.#p53 - this.#p28 > 1 );

		this.#P8(
			this.#p62,
			this.#p35,
 k2 - this.#p35.M53(),
			false
		).then(
			() => {
				this.#p35.M65();
				this.#p61 = false;
			}
		);
	}

/* #FightBarehanded */ #P16 () {
		const card = this.#p35.M12();
		if ( card === null ) {
			this.#P40( "Fight barehanded &raquo; Select a monster from the dungeon." );
		} else {
			this.#P7( card, this.#p36, false );
			if ( this.#p52.M36( - card.M68() ) === 0 ) {
				this.#P37( false );
			} else {
				this.#P11();
			}
		}
	}

/* #Run */ #P41 () {
		if ( this.#p28 >= 0 && this.#p53 - this.#p28 <= 1 ) {
			this.#P40( "Run &raquo; No two consecutive rooms can be avoided." );
			return;
		}

		if ( this.#p35.M53() < k2 ) {
			this.#P40( "Run &raquo; Not possible after playing cards." );
			return;
		}

		this.#p28 = this.#p53;
		this.#p52.M89( false );
		this.#p61 = true;

		this.#P10(
			0.33,
 k2,
			() => {
				this.#p62.M9( this.#p35.M21() );
			}
		).then(
			() => {
				this.#p61 = false;
				this.#P36();
			}
		);
	}

/* #GameOver */ #P37 ( win ) {
		this.#p18 = true;
		var score = 0;
		
		if ( ! win ) {
			this.#p62.M6(
				card => card.M80()
			).forEach(
				card => score -= card.M68()
			);
		} else {
			score = this.#p52.M66();

			this.#p35.M6(
				card => card.M71()
			).forEach(
				card => score += card.M68()
			);
			
			this.#p62.M6(
				card => card.M71()
			).forEach(
				card => score += card.M68()
			);
			
		}

		this.#p17.M47( "Game over &raquo; You scored " + score + "." );

		this.#p52.M27( win, score );
	}
}

"use strict;"

/* CardPile */
class E0 extends E3 {
/* #id */ #p70 = null;
/* #lst_cards */ #p19 = [];
/* #delay */ #p54 = 0;
/* #top_card_face */ #p4 = false;
/* #base */ #p64 = null;
/* #e_counter */ #p20 = null;

	constructor ( id ) {
		super( id, "column", "center", "center", true );

		this.#p70 = id;

		this.#p64 = new C0( this.#p70 + "_Base", true );
		this.M59( this.#p64 );

		const E_BASE = this.#p64.M49();
		E_BASE.classList.add( "CardPileBase" );
		E_BASE.classList.add( "Clickable" );

		this.#p20 = document.createElement( "p" );
		this.#p20.classList.add( "Hidden" );
		E_BASE.appendChild( this.#p20 );
	}

/* GetBaseElement */ M16 () {
		return this.#p64.M49();
	}

/* GetCards */ M72 () {
		return g8( this.#p19 );
	}

/* SetTopCardFace */ M17 ( status ) {
		this.#p4 = status;
		if ( this.#p19.length > 0 ) {
			this.#p19[ this.#p19.length - 1 ].M60( status );
		}
	}

/* UpdateEntities */ M18 ( card_width, card_height ) {
		this.M7( card_width, card_height );
		this.M1();
		this.#P12();
		this.#p20.style.fontSize = Math.round( card_width * 0.09 ) + "px";
	}

/* #SetCardsPosition */ #P12 () {
		const [ TOP, LEFT ] = this.#p64.M37();
		this.#p19.forEach(
			card => card.M38( TOP, LEFT )
		);
	}

/* SetCardsIndex */ M25 () {
		var z = 1;
		this.#p19.forEach(
			card => card.M63( z ++ )
		);
	}

/* SetDelay */ M73 ( value ) {
		this.#p54 = value;
	}
	
/* AddCardToTop */ M30 ( card ) {
		this.M81( card, true );
	}
	
/* AddCardToBottom */ M9 ( card ) {
		this.M81( card, false );
	}
	
/* AddCard */ M81 ( card, to_top = true ) {
		

		if ( this.#p19.includes( card) ) {
			return 
		}

		this.#p19[ to_top ? "push" : "unshift" ]( card );
		this.#p20.innerHTML = this.#p19.length;
		
		const [ TOP, LEFT ] = this.#p64.M37();
		card.M39( false );
		card.M60( false );
		card.M38( TOP, LEFT );
		if ( to_top ) {
			card.M63( 100 + this.#p19.length );
		} else {
			card.M63( 0 );
		}
		card.M40( this );

 g15( this.#p54 ).then(
			_ => {
				this.M25();
				this.M3();
			}
		);
	}

/* GetBasePosition */ M10 () {
		return this.#p64.M37();
	}

/* GetCardFromTop */ M19 () {
		if ( this.#p19.length === 0 ) {
			
			return null;
		}

		const CARD = this.#p19.pop();
		CARD.M63( 100 + this.#p19.length );
		CARD.M61( false );
		this.M3();
		this.#p20.innerHTML = this.#p19.length;

		return CARD;
	}

/* HideAllButTopCard */ M3 () {
		var idx = this.#p19.length - 1;

		if ( idx >= 0 ) {
			var card = this.#p19[ idx ];
			card.M61( false );
			card.M60( this.#p4 );
			for ( -- idx; idx >= 0; -- idx ) {
				card = this.#p19[ idx ];
				card.M61( true );
				card.M60( false );
			}
		}
	}

/* IsEmpty */ M82 () {
		return ( this.#p19.length === 0 );
	}
	
/* GetNrCards */ M53 () {
		return this.#p19.length;
	}

/* RemoveCard */ M54 ( card ) {
		

		if ( ! this.#p19.includes( card) ) {
			return 
		}

 g2( this.#p19, card );
		card.M61( false );
		this.#p20.innerHTML = this.#p19.length;
		this.M3();

		return card;
	}

/* ShowCounter */ M42 ( status ) {
		this.#p20.classList[ status ? "remove" : "add" ]( "Hidden" );
		if ( status ) {
			this.#p20.innerHTML = this.#p19.length;
		}
	}

/* SendCardsToPile */ M11 ( card_pile ) {
		

		var card;
		while ( this.#p19.length > 0 ) {
			card = this.#p19[ 0 ];
			this.M54( card );
			card_pile.M81( card );
		}
	}

/* GetClickTarget */ M14 () {
		return this.#p64.M49();
	}

/* ShuffleCards */ M31 () {
		if ( this.#p19.length > 1 ) {
 g7( this.#p19 );
			this.M25();
			this.M3();
		}
	}

/* Highlight */ M64 ( status ) {
		this.M49().classList[ status ? "add" : "remove" ]( "Highlight" );
	}

/* GetFilteredCards */ M6 ( fn ) {
		return this.#p19.filter( fn );
	}

}

"use strict;"

/* CardsRow */
class E1 extends E3 {
/* #id */ #p70 = null;
/* #max_cards */ #p21 = 0;
/* #lst_cards */ #p19 = [];
/* #is_hand */ #p37 = false;
/* #selected_card */ #p5 = null;
/* #weapon */ #p46 = 0;
/* #monster */ #p38 = Infinity;
	
	constructor ( id, max_cards ) {
		super(
			id,
			"row",
			isNaN( parseInt( max_cards, 10 ) ) ? "center" : "evenly",
			"center",
			true
		);

		this.#p70 = id;
		this.#p21 = max_cards;
		this.#p37 = isNaN( parseInt( max_cards, 10 ) );
	}

/* IsHand */ M87 () {
		return this.#p37;
	}

/* onResize */ f22 ( width, height, top, left ) {
		super.f22( width, height, top, left );
	}

/* SetClickable */ M32 ( status ) {
		this.M49().classList[ status ? "add" : "remove "]( "Clickable" );
	}
	
/* GetClickTarget */ M14 () {
		return this.M49();
	}

/* AddCard */ M81 ( card, to_end = true ) {
		

		if ( this.#p19.length === this.#p21 ) {
			return 
		}
		if ( this.#p19.includes( card) ) {
			return 
		}

		card.M40( this );
		card.M60( true );
		card.M63( 100 + this.#p19.length );

		if ( to_end ) {
			
			
			if ( card.M52() ) {
				this.#p46 = card.M68();
			} else if ( card.M80() ) {
				this.#p38 = card.M68();
			}

			this.#p19.push( card );
		} else {
			
			this.#p19.unshift( card );
		}
		this.M59( card, to_end );

		return true;
	}

/* RemoveCard */ M54 ( card ) {
		

		if ( ! this.#p19.includes( card ) ) {
			return 
		}
		
 g2( this.#p19, card );
		this.M28( card );

		if ( card === this.#p5 ) {
			card.M39( false );
			this.#p5 = null;
		}

		if ( this.#p37 && this.#p19.length === 0 ) {
			this.#p46 = 0;
			this.#p38 = Infinity;
		}

		return card;
	}

/* ClearCards */ M55 ( card_pile ) {
		
		
		var card;
		while ( this.#p19.length > 0 ) {
			card = this.#p19[ 0 ];
			this.M54( card );
			card_pile.M81( card );
		}

		if ( this.#p37 ) {
			
			this.#p46 = 0;
			this.#p38 = Infinity;
		}
	}

/* SelectCard */ M56 ( card ) {
		

		if ( this.#p5 !== null ) {
			this.#p5.M39( false );
			if ( this.#p5 === card ) {
				this.#p5 = null;
				return;
			}
		}
		
		this.#p5 = card;
		this.#p5.M39( true );
	}

/* GetSelectedCard */ M12 () {
		

		return this.#p5;
	}

/* UnselectSelectedCard */ M0 () {
		

		if ( this.#p5 !== null ) {
			this.#p5.M39( false );
			this.#p5 = null;
		}
	}

/* GetNrCards */ M53 () {
		return this.#p19.length;
	}

/* GetCards */ M72 () {
		return g8( this.#p19 );
	}

	_Status () {
		
		
	}

/* TestAddCard */ M43 ( card ) {
		

		if ( this.#p19.length === 0 ) {
			if ( ! card.M52() ) {
				return 1;
			}
		} else {
			
			if ( ! card.M80() ) {
				return 2;
			} else if ( card.M68() >= this.#p38 ) {
				return ( - this.#p38 );
			}
		}

		return 0;
	}

/* GetMonster */ M57 () {
		return this.#p38;
	}

/* GetWeaponValue */ M20 () {
		
		
		return this.#p46;
	}
	
/* RemoveLastCard */ M21 () {
		
		return this.M54(
			this.#p19[ this.#p19.length - 1 ]
		);
	}

/* SortCards */ M65 () {
		this.M8(
			lst => {
				this.#p19 = lst.sort(
					( a, b ) => {
						if ( b.M92() || a.M92() ) {
							if ( b.M92() && ! a.M92() ) {
								return 1;
							}
							if ( a.M92() && ! b.M92() ) {
								return -1;
							}
							if ( b.M77() !== a.M77() ) {
								return Math.sign( b.M77() - a.M77() );
							}
						}
						return Math.sign( b.M68() - a.M68() );
					}
				);
				return g8( this.#p19 );
			}
		);
		this.M1();
	}
}

"use strict;"

/* Deck */
class C4 {
/* #lst_cards */ #p19 = [];
/* #lst_cards_out */ #p6 = [];
/* #nr_jokers */ #p22 = 0;
/* #total_cards */ #p10 = 0;
	
	constructor ( nr_jokers ) {
		this.#p22 = nr_jokers;

		this.#P33();
	}

/* #MakeCards */ #P33 () {
		var card, id = 0;
		const LST_COLORS = [];
		var suit, value, color;
		for ( suit = 0; suit < 4; ++ suit ) {
			color = this.M34( suit );
			if ( ! LST_COLORS.includes( color ) ) {
				LST_COLORS.push( color );
			}
			for ( value = 2; value <= 14; ++ value ) {
				card = new E4(
					id ++,
					{ id: suit, symbol: this.M26( suit ), color: color },
					{ nr: value, symbol: this.M22( value ) }
					);
					this.#p19.push( card );
					this.#p10 += 1;
			}
		}
		var idx_color = 0, n;
		for ( n = 1; n <= this.#p22; ++ n ) {
			card = new E4(
				id ++,
				{ id: k12, symbol: this.M26( k12 ), color: LST_COLORS[ idx_color ] },
				{ nr: k6, symbol: this.M22( k6 ) }
			);
			
			this.#p19.push( card );
			this.#p10 += 1;

			idx_color = ( 1 + idx_color ) % LST_COLORS.length;
		}
	}

/* DiscardCards */ M33 ( fn ) {
		if ( this.#p6.length > 0 ) {
			
			return;
		}

		const lst_cards = this.#p19.filter( fn );

		

		this.#p10 -= lst_cards.length;
		
		lst_cards.forEach(
			card => {
 g2( this.#p19, card );
			}
		)

		

		return lst_cards;
	}

/* onResize */ f22 ( card_width, card_height ) {
		this.M44( card => card.M76( card_width, card_height ) );
	}

/* ForEachCard */ M44 ( fn ) {
		this.#p19.forEach( fn );
		this.#p6.forEach( fn );
	}

/* Shuffle */ M83 () {
 g7( this.#p19 );
	}

/* GetCard */ M84 () {
		if ( this.#p19.length === 0 ) {
			return null;
		}

		const CARD = g0( this.#p19 );
		this.#p6.push( CARD );
		
		return CARD;
	}

/* Reset */ M93 () {
		while ( this.#p6.length ) {
			this.#p19.push( this.#p6.pop() );
		}

		
	}

/* GetSuitSymbol */ M26 ( suit ) {
		return k21.filter( data => data.id === suit ).pop().symbol;
	}
	
/* GetSuitColor */ M34 ( suit ) {
		return k21.filter( data => data.id === suit ).pop().color;
	}
	
/* GetValueSymbol */ M22 ( value ) {
		if ( value === k6 || 11 <= value && value <= 13 || value === k19 ) {
			return k16.filter( data => data.value === value ).pop().symbol;
		}
		return value;
	}

/* SetCardsSize */ M35 ( card_width, card_height ) {
		this.M44(
			card => card.M76( card_width, card_height )
		);
	}

/* GetFilteredCards */ M6 ( fn ) {
		const lst_cards = this.#p19.filter( fn );
		
		lst_cards.forEach(
			card => {
 g2( this.#p19, card );
				this.#p6.push( card );
			}
		)

		return lst_cards;
	}

/* GetNrCards */ M53 () {
		return this.#p19.length;
	}

/* GetNrTotalCards */ M13 () {
		return this.#p10;
	}

/* GetRemainingCards */ M4 () {
		const lst_cards = [];
		var card;

		while ( this.#p19.length > 0 ) {
			var card = this.#p19.pop();
			this.#p6.push( card );
			lst_cards.push( card );
		}

		return lst_cards;
	}

}

/* Menu */
class C5 {
/* #element */ #p31 = null;
/* #icon */ #p65 = null;
	#lst_elements =null;

    constructor  ( element, icon ) {
        this.#p31 = element;
        this.#p65 = icon;

		this.#lst_elements = Array.from( element.children );
		
		this.#p65.classList.add( "Clickable" );

		this.#lst_elements.forEach(
			e => e.classList.add( "Clickable" )
		);
    }

/* GetElements */ M45 () {
		return g8( this.#lst_elements );
	}

/* Show */ M95 () {
		this.#p31.style.right = 0;
	}
    
/* Hide */ M96 () {
		this.#p31.style.right = ( -1.1 * this.#p31.offsetWidth ) + "px"
	}
    
/* Toggle */ M88 () {
		this.#p31.style.right === "0px"
			? this.M96()
			: this.M95();
	}

/* ShowIcon */ M74 ( status = true ) {
		this.#p65.classList[ status ? "remove" : "add" ]( "Hidden" );
	}

	IsIcon( e ) {
		return e.id.startsWith( "Menu" );
	}
	
/* EnablePlay */ M58 ( status ) {
 g14( "Menu_Play" ).classList[ status ? "remove" : "add" ]( "Hidden" );
	}

}

"use strict;"

/* Messenger */
class C1 {
/* #element */ #p31 = null;
/* #txt */ #p68 = null;
/* #show_time */ #p23 = 0;
/* #timer */ #p55 = 0;
	
	constructor ( show_time ) {
		this.#p31 = document.createElement( "div" );
		this.#p31.id = "Messenger";
		this.#p68 = document.createElement( "p" );
		this.#p31.appendChild( this.#p68 );

		this.#p23 = ( show_time < 1E3 ? 1E3 * show_time : show_time );
	}

/* GetElement */ M49 () {
		return this.#p31;
	}

/* onResize */ f22 ( width, height, top, left ) {
		this.#p31.style.width = width + "px";
		this.#p31.style.height = height + "px";
		this.#p31.style.left = left + "px";
		
		this.#p68.style.fontSize = Math.min(
			Math.round( height * 0.25 ),
			17
		) + "px";

		this.M96();
	}

/* Hide */ M96 () {
		this.#p31.style.top = ( - 1.1 * this.#p31.offsetHeight ) + "px";
	}
	
/* ShowPrefixMessage */ M5 ( prefix, message ) {
		if ( this.#p23 > 0 ) {
			this.M46( "<span>" + prefix + "</span>: " + message );
		}
	}

/* ShowMessage */ M46 ( message ) {
		if ( this.#p23 > 0 ) {
			clearTimeout( this.#p55 );
			this.#p55 = setTimeout( this.M96.bind( this ), this.#p23 );
			this.#p68.innerHTML = message;
			this.#p31.style.top = 0;
		}
	}
	
/* ShowForever */ M47 ( message ) {
		clearTimeout( this.timer );
		this.#p68.innerHTML = message;
		this.#p31.style.top = 0;
	}

}

"use strict;"

/* PilesRow */
class E2 extends E3 {
/* #id */ #p70 = null;
/* #draw */ #p62 = null;
/* #discard */ #p36 = null;
	constructor ( id ) {
		super( "PilesRow_" + id, "row", "evenly", "center", true );

		this.#p70 = id;
		this.#p62 = new E0( id + "_Draw" );
		this.#p36 = new E0( id + "_Discard" );

		this.#p36.M42( true );
		this.#p62.M42( true );

		this.M59( this.#p62 );
		this.M59( this.#p36 );
	}

/* onResize */ f22 ( width, height, top, left, card_width, card_height ) {
		super.f22( width, height, top, left );
		this.M7( Math.min( Math.round( width / 3 ), height), height );
		this.M1();

		this.M24(
			e => {
				if ( e instanceof E0 ) {
					e.M18( card_width, card_height );
				} else {
					
					e.M49().style.fontSize = Math.round( card_width * 0.12 ) + "px";
				}
			}
		);
	}

/* GetDrawPile */ M48 () {
		return this.#p62;
	}

/* GetDiscardPile */ M23 () {
		return this.#p36;
	}

/* GetElements */ M45 () {
		return [
			this.M49(),
			this.#p62.M49(),
			this.#p36.M49(),
			this.#p62.M16(),
			this.#p36.M16()
		];
	}

}

/* Stats */
class C3 {
/* #element */ #p31 = null;

/* #health */ #p47 = 0;
/* #e_health */ #p29 = null;
/* #e_health_left */ #p7 = null;
/* #e_health_right */ #p2 = null;
/* #e_health_update */ #p1 = null;
/* #MIN_HEALTH */ #p13 = 0;
/* #MAX_HEALTH */ #p14 = 0;
/* #txt_health */ #p15 = null;
/* #txt_run */ #p39 = null;
/* #txt_heal */ #p30 = null;
/* #display_health */ #p3 = 0;
/* #DELAY */ #p56 = 100;
/* #LST_MAX */ #p40 = 10;
/* #KEY */ #p69 = "stats";

/* #data */ #p66 = {
        games_finished: 0,
        games_won: 0,
        lst_last_scores: [],
        lst_best_scores: []
    }

    constructor  ( element, min_health, max_health ) {
        this.#p31 = element;
        this.#p13 = min_health;
        this.#p14 = max_health

        element.appendChild( this.#p7 = this.#P34( "HealthLeft" ) );
        this.#p29 = document.createElement( "div" );
        this.#p29.id = "Health";
        element.appendChild( this.#p29 );
        element.appendChild( this.#p2 = this.#P34( "HealthRight" ) );
        this.#p15 = document.createElement( "div" );
        this.#p15.innerHTML = "--";
        this.#p29.appendChild( this.#p15 );
        this.#p1 = document.createElement( "div" );
        this.#p29.appendChild( this.#p1 );
        const div = document.createElement( "div" );
        this.#p29.appendChild( div );
        this.#p39 = document.createElement( "span" );
        this.#p39.innerHTML = "R";
        this.#p30 = document.createElement( "span" );
        this.#p30.innerHTML = "H";
        div.appendChild( this.#p39 );
        div.appendChild( this.#p30 );

        [ "latest", "best" ].forEach(
            key => {
                var e = g14( "lst_" + key + "_scores" );
                var i, p;
                for ( i = 0 ; i < this.#p40; ++ i ) {
                    p = document.createElement( "p" );
                    e.appendChild( p );
                    p.id= key + "_" + i;
                }
            }
        );

        this.#P30();
        
    }

/* Reset */ M93 () {
        this.#p47 = this.#p3 = this.#p14;
        this.#p1.innerHTML = "";
        
        this.M85( true );
        this.M89( true );
        this.#P31();
    }
    
/* ClearHealthUpdates */ M2 () {
        this.#p1.innerHTML = "";
    }

/* #MakeGauge */ #P34 ( id ) {
        const div = document.createElement( "div" );
        div.id = id;
        const e = document.createElement( "div" );
        div.appendChild( e );
		return div;
	}

/* onResize */ f22 ( width, height ) {
        this.#p31.style.height = height + "px";
        const FS1 = Math.round( width * 0.4 * 0.09 );
        this.#p7.style.fontSize = FS1 + "px";
        this.#p2.style.fontSize = FS1 + "px";
	}

/* UpdateHealth */ M36 ( value ) {
        

        this.#p47 += value;
        this.#p1.innerHTML = ( value > 0 ? "+" : "" ) + value;
        
        if ( this.#p47 > this.#p14 ) {
            this.#p47 = this.#p14;
        } else if ( this.#p47 < this.#p13 ) {
            this.#p47 = this.#p13;
        }

        if ( this.#p3 !== this.#p47 ) {
            setTimeout(
                this.#p16.bind( this ),
                this.#p56
            );
        }

        return this.#p47;
    }

/* #StepHealth */ #p16 = function () {
        this.#p3 += Math.sign( this.#p47 - this.#p3 );
        this.#P31();

        if ( this.#p3 !== this.#p47 ) {
            setTimeout( this.#p16.bind( this ), this.#p56 );
        }
    }
    
/* #UpdateInfo */ #P31 () {
        this.#p15.innerHTML = this.#p3;
        const W = Math.floor( 100 * ( this.#p3 / this.#p14 ) );
 g12( "div", this.#p7 ).style.width = W + "%";
 g12( "div", this.#p2 ).style.width = W + "%";
    }

/* SetRun */ M89 ( status ) {
        this.#p39.classList[ status ? "remove" : "add" ]( "Disabled" );
    }

/* SetHeal */ M85 ( status ) {
        this.#p30.classList[ status ? "remove" : "add" ]( "Disabled" );
    }

/* GetHealth */ M66 () {
        return this.#p47;
    }

/* UpdateHistory */ M27 ( win, score ) {
        this.#p66.games_finished += 1;
        
        if ( win ) {
            this.#p66.games_won += 1;
        }


        this.#p66.lst_last_scores.unshift( score) ;
        this.#p66.lst_last_scores = this.#p66.lst_last_scores.splice( 0, this.#p40 );

        this.#p66.lst_best_scores.push( score) ;
        this.#p66.lst_best_scores.sort(  ( x, y ) => y - x );
        this.#p66.lst_best_scores = this.#p66.lst_best_scores.splice( 0, this.#p40 );

        
        
        
        
        
        

        this.#P23();

        this.#P19( score );
    }

/* #UpdateScoreList */ #P17 ( key, lst_v, score ) {
        var lst_e = g14( "lst_" + key + "_scores" ).children;
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

/* #MakeStorageData */ #P18 () {
        var data = {}, key;
        
        for ( key in this.#p66 ) {
            data[ key ] = this.#p66[ key ];
        }
        
        return data;
    }

/* #UpdateStorage */ #P23 () {
        A0.Storage.f15( this.#p69, this.#P18() );
    }

/* #UpdateFromStorage */ #P9 ( storage_data ) {
        for ( var key in storage_data ) {
            if ( this.#p66.hasOwnProperty( key ) ) {
                this.#p66[ key ] = storage_data[ key ];
            } else {
                
            }
        }
    }

/* #InitStorage */ #P30 () {
        var data = this.#P18();

        if ( A0.Storage.f8( this.#p69, data ) ) {
            this.#P9( data );
        }

        this.#P19( Infinity );
    }

/* #UpdateStatsInfo */ #P19 ( score ) {
 g14( "txt_stats_finished" ).innerHTML = this.#p66.games_finished;
 g14( "txt_stats_won" ).innerHTML = this.#p66.games_won;
        if ( this.#p66.games_finished > 0 ) {
 g14( "txt_stats_winratio" ).innerHTML = Math.round( this.#p66.games_won / this.#p66.games_finished * 100 ) + "%";
        } else {
 g14( "txt_stats_winratio" ).innerHTML = "0%";
        }

        this.#P17( "latest", this.#p66.lst_last_scores, score );
        this.#P17( "best", this.#p66.lst_best_scores, score );
    }

}

"use strict;"

const k1 = 16 / 11;

var REDS_MAX = 10;
const k17 = 5;
const k18 = 0;

const k0 = g9( "CARD_TRANSLATE_TIME", true );

const k2 = 4;
const k9 = 20;
const k10 = 0;

const k4 = 0;
const k5 = 1;
const k3 = 2;
const k11 = 3;
const k12 = 4;
const k13 = [ "hearts", "spades", "diamonds", "clubs", "joker" ];

const k6 = 0;
const k14 = 11;
const k7 = 12;
const k15 = 13;
const k19 = 14;

const k20 = "Red";
const k8 = "Black";

const k21 = [
	{ id: k4,		symbol: "&hearts;",	color: k20 },
	{ id: k5,		symbol: "&spades;",	color: k8 },
	{ id: k3,	symbol: "&diams;",	color: k20 },
	{ id: k11,		symbol: "&clubs;",	color: k8 },
	{ id: k12,		symbol: "",	color: "" }
];

const k16 = [
	{ value: k14, symbol: "J" },
	{ value: k7, symbol: "Q" },
	{ value: k15, symbol: "K" },
	{ value: k19, symbol: "A" },
	{ value: k6, symbol: "&#x2605;" }
];

"use strict;"

window.addEventListener(
	"load",
	() => {
 new C2();
	}
);

