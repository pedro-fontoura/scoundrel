
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

A0.f23 = /* Init */ function ( onResize, onClick ) {
	
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
	
	A0.f18( null );
	
	this.client_onResize = onResize || null;
	this.client_onClick = onClick || null;
	
	window.visualViewport.addEventListener( "resize", A0.f18.bind( this ) );
};

A0.f18 = /* onResize */ function ( evt ) {
	
	this.viewport_width = this.viewport.offsetWidth;
	this.viewport.style.height = window.visualViewport.height + "px";
	
	this.pages_container.style.width = ( this.nr_pages * this.viewport_width ) + "px";
	
	this.pages_container.style.left = (
		- this.current_page_idx * this.viewport.offsetWidth
	) + "px";
	
	this.lst_pages.forEach(
		page => page.style.width = this.viewport_width + "px"
	);

	this.f8();
	this.f11();
	
	if ( this.client_onResize !== null ) {
		this.client_onResize( this.viewport_width, this.viewport.offsetHeight );
	}
};

A0.f19 = /* GetWidth */ function () {
	return this.viewport_width;
};

A0.f15 = /* GetHeight */ function () {
	return this.viewport.offsetHeight;
};

A0.f20 = /* ShowPage */ function ( n = "" ) {
	
	if ( typeof n === "string" ) {
		var idx = 0, pg_id = n;
		n = this.current_page_idx;
		while ( idx < this.nr_pages ) {
			if ( this.lst_pages[ idx ].id === pg_id ) {
				n = idx;
				break;
			}
			idx ++;
		}
	}
	
	this.pages_container.style.left = ( - n * this.viewport.offsetWidth ) + "px";

	this.previous_page_idx = this.current_page_idx;
	this.current_page_idx = n;

	return n;
};

A0.f9 = /* GetCurrentPage */ function () {
	return this.current_page_idx;
};

A0.f4 = /* GetCurrentPageId */ function () {
	return this.lst_pages[ this.current_page_idx ].id;
};

A0.f8 = /* ShowCurrentPage */ function () {
	this.f20( this.current_page_idx );
};

A0.f5 = /* ShowPreviousPage */ function () {
	this.f20( this.current_page_idx );
};

A0.f13 = /* SetPageMode */ function ( page_mode, page_rotate_id ) {
	this.page_mode = page_mode;
	this.page_rotate_id = page_rotate_id;
	this.f11();
};

A0.f11 = /* TestPageMode */ function () {
	this.show_page = false;

	if ( this.page_mode !== this.PAGE_FREE ) {
		const status = Math.sign(
			this.viewport.offsetWidth - this.viewport.offsetHeight
		);
		if ( status !== this.page_mode ) {
			if ( this.page_before_rotate === -1 ) {
				this.page_before_rotate = this.current_page_idx;
			}
			this.f20( this.page_rotate_id );
			this.show_page = true;
		} else {
			if ( this.page_before_rotate !== -1 ) {
				this.f20( this.page_before_rotate );
				this.page_before_rotate = -1;
				this.show_page = true;
			}
		}
	}

	if ( ! this.show_page ) {
		this.f8();
	}

	return this.show_page;
};

A0.f0 = /* AddClickEventListener */ function ( evt_target, js_entity ) {
	evt_target.addEventListener( 
		this.mouse_or_touch,
		this.f21.bind( this, js_entity )
	);
	
	evt_target.addEventListener(
		"contextmenu",
		this.f10.bind( this )
	);
};

A0.f6 = /* AddEventListener */ function ( element, event_name, handler ) {
	if ( event_name === "MOUSE||TOUCH" ) {
		event_name = this.mouse_or_touch;
	}
	
	if ( event_name === "mousedown" ) {
		element.addEventListener( "contextmenu", this.f10.bind( this ) );
	}

	element.addEventListener( event_name, handler );
};

A0.f12 = /* ConsumeEvent */ function ( evt ) {
	evt.stopPropagation();
	evt.preventDefault();
	return evt.target;
}

A0.f21 = /* onClick */ function ( js_entity, evt ) {
	this.f12( evt );
	if ( this.client_onClick !== null ) {
		this.client_onClick( js_entity, evt.target );
	}
};

A0.f10 = /* onContextMenu */ function ( evt ) {
	this.f12( evt );
	evt.target.click();
};

A0.f1 = /* RegisterServiceWorker */ function ( sw_file ) {
	if (
		"serviceWorker" in navigator
		&& window.location.protocol === "https:"
		&& window.cordova === undefined
	) {
		if ( this.A1 && ! this.A1.f22() ) {
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
			this.f16( "Unhandled rejection", evt.reason );
			
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
			this.f16( "Error", str );
			
		 }
	);
};

A0.f2 = /* ProcessStackTrace */ function ( error ) {
	return error.stack.split( " at " ).join( "<br>&bull; " );
};

A0.f16 = /* ShowError */ function ( title, txt ) {
	this.error_node.innerHTML += "<h3>" + title + "</h3>" + txt;
	if ( this.error_page !== null ) {
		this.f20( this.error_page.id );
	}
};

"use strict;"

/* FlexBoxEntity */
class C0 {
	
/* #id */ #p61 = null;
/* #top */ #p59 = Infinity;
/* #left */ #p50 = Infinity;
/* #width */ #p41 = Infinity;
/* #height */ #p38 = Infinity;
/* #element */ #p30 = null;

	constructor ( id, make_element = false ) {
		this.#p61 = id;
		
		if ( make_element === true ) {
			this.#p30 = this.#P20();
		} else if ( make_element instanceof Node ) {
			this.#p30 = make_element;
			this.#p30.id = this.#p61;
			this.#p30.classList.add( "FlexBoxEntity" );
		}
	}

/* #MakeElement */ #P20 () {
		const element = document.createElement( "div" );
		element.id = this.#p61;
		element.classList.add( "FlexBoxEntity" );

		return element;
	}

/* GetId */ M90 () {
		return this.#p61;
	}

/* GetPosition */ M37 () {
		return [ this.#p59, this.#p50 ];
	}

/* GetElement */ M49 () {
		return this.#p30;
	}

/* GetWidth */ f19 () {
		return this.#p41;
	}
	
/* GetHeight */ f15 () {
		return this.#p38;
	}
	
/* GetTop */ M86 () {
		return this.#p59;
	}
	
/* GetLeft */ M75 () {
		return this.#p50;
	}
	
/* onResize */ f18 ( width, height, top, left ) {
		this.M38( top, left );
		this.M76( width, height );
	}
	
/* SetPosition */ M38 ( top, left ) {
		this.#p59 = top;
		this.#p50 = left;
		
		if ( this.#p30 !== null ) {
			this.#p30.style.top = top + "px";
			this.#p30.style.left = left + "px";
		}
	}
	
/* SetSize */ M76 ( width, height ) {
		this.#p41 = width;
		this.#p38 = height;

		if ( this.#p30 !== null ) {
			this.#p30.style.width = width + "px";
			this.#p30.style.height = height + "px";
		}
	}
}

"use strict;"

/* FlexBox */
class E3 extends C0 {

/* #orientation */ #p9 = null;
/* #justify */ #p31 = null;
/* #align */ #p42 = null;
/* #lst_entities */ #p8 = [];
	
	constructor ( id, orientation, justify, align, make_element = false ) {
		super( id, make_element );

		this.#p9 = orientation;
		this.#p31 = justify;
		this.#p42 = align;

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

/* onResize */ f18 ( width, height, top, left, e_width = 0, e_height = 0 ) {
		super.f18( width, height, top, left );
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
				entities_width += e.f19();
				entities_height += e.f15();
			}
		);

		if ( entities_width === Infinity || entities_height === Infinity ) {
			return;
		}

		var lst_left, lst_top;
		
		if ( this.#p9 === "row" ) {
			lst_left = this.#P4( this.#p31 )( true, "width", entities_width );
			lst_top = this.#P4( this.#p42 )( false, "height", entities_height );
		} else {
			lst_top = this.#P4( this.#p31 )( true, "height", entities_height );
			lst_left = this.#P4( this.#p42 )( false, "width", entities_width );
		}

		this.#p8.forEach(
			e => {
				e.M38( lst_top.shift(), lst_left.shift() );
			}
		);
	}

/* ForEachEntity */ M25 ( fn ) {
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
					position += ( key === "width" ? e.f19() : e.f15() );
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
		const THIS_KEY = ( key === "width" ? this.f19() : this.f15() );
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
						( key === "width" ? e.f19() : e.f15() )
					) / 2
				);
			}
		}
				
		return lst;
	}

/* #MakeDistributionList_end */ #P3 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p8.length;
		const THIS_KEY = ( key === "width" ? this.f19() : this.f15() );
		const step = Math.round( THIS_KEY - entities_size );

		for ( var e, idx = 0; idx < LEN; ++ idx ) {
			if ( axis ) {
				lst[ idx ] += step;
			} else {
				e = this.#p8[ idx ];
				lst[ idx ] += THIS_KEY - ( key === "width" ? e.f19() : e.f15() );
			}
		}

		return lst;
	}
	
/* #MakeDistributionList_evenly */ #P1 ( axis, key, entities_size ) {
		const lst = this.#P5( axis, key );
		const LEN = this.#p8.length;
		const THIS_KEY = ( key === "width" ? this.f19() : this.f15() );
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

A0.A1.f22 = /* Touch */ function () {
	return navigator.maxTouchPoints > 0;
};

A0.A1.f24 = /* iOS */ function () {
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
	if ( ! document.fullscreenElement && this.f22() && ! this.f24() ) {
		if ( document.documentElement.requestFullscreen instanceof Function ) {
			document.documentElement.requestFullscreen( { navigationUI: "hide" } );
		}
	}
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

Math.f17 = /* randomInt */ function ( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
};

Math.f14 = /* randomFloat */ function ( min, max ) {
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
	return g4( array, Math.f17( 0, array.length - 1 ) );
}

/* GetRandomElement */ function g5 ( array ) {
	return array[ Math.f17( 0, array.length - 1 ) ];
}

"use strict;"

/* Card */
class E4 extends C0 {
/* #id */ #p61 = null;
/* #suit */ #p51 = -1;
/* #value */ #p43 = -1;
/* #color */ #p44 = -1;
/* #face_up */ #p32 = true;
/* #selected */ #p23 = false;
/* #show_royals_value */ #p0 = true;
/* #location */ #p24 = null;
	constructor ( id, suit, value ) {
		super( "Card_" + id, true );

		this.#p61 = id;
		this.#p51 = suit.id;
		this.#p43 = value.nr;
		this.#p44 = suit.color;
		
		this.e_body = null;
		this.e_face = null;
		this.e_back = null;
		this.e_value = null;
		this.e_value_nr = null;
		this.e_suit = null;
		
		this.M67( value.symbol, value.nr  );
		
		if ( this.#p51 === k11 ) {
			this.e_suit.innerHTML = "<img src='images/triton-head.svg'>";
		} else if ( this.#p51 === k5 ) {
			this.e_suit.innerHTML = "<img src='images/daemon-skull.svg'>";
		} else if ( this.#p51 === k4 ) {
			this.e_suit.innerHTML = "<img src='images/health-potion.svg'>";
		} else if ( this.#p51 === k3 ) {
			this.e_suit.innerHTML = "<img src='images/sword-spin.svg'>";
		} else {
			this.e_suit.innerHTML = suit.symbol;
		}

		this.e_value.classList.add( "Suit_" + k13[ this.#p51 ] );
		this.e_face.classList.add( "Suit_" + k13[ this.#p51 ] );
		
		this.M9( this.#p0 );
	}

/* GetClickTarget */ M15 () {
		return this.e_body;
	}

/* ShowRoyalsValue */ M9 ( status ) {
		this.#p0 = status;
		
		if ( status && ( this.M78() || this.M91() ) ) {
			this.e_value_nr.classList.remove( "Hidden" );
		} else {
			this.e_value_nr.classList.add( "Hidden" );
		}
	}

/* MakeBody */ M67 ( value_symbol, value_nr ) {
		this.e_body = document.createElement( "div" );
		this.e_body.classList.add( "CardBody" );
		this.e_body.classList.add( "Clickable" );
		
		
		this.e_face = document.createElement( "div" );
		this.e_face.classList.add( "CardFace" );
		this.e_body.appendChild( this.e_face )
		
		this.e_back = document.createElement( "div" );
		this.e_back.classList.add( "CardBack" );
		this.e_body.appendChild( this.e_back )

		this.e_value = document.createElement( "p" );
		this.e_value.classList.add( "CardValue" );
		this.e_value.classList.add( "CardValue" + this.#p44 );
		const SPAN = document.createElement( "span" );
		SPAN.innerHTML = value_nr;
		this.e_value.appendChild( SPAN );
		this.e_face.appendChild( this.e_value );

		this.e_value_nr = document.createElement( "span" );
		this.e_value.appendChild( this.e_value_nr );
		
		this.e_suit = document.createElement( "p" );
		this.e_suit.classList.add( "CardSuit" );
		this.e_suit.classList.add( "CardSuit" + this.#p44 );
		this.e_face.appendChild( this.e_suit );

		if ( ! this.#p32 ) {
			this.e_body.classList.add( "FaceDown" );
		}

		const ELEMENT = this.M49();
		ELEMENT.classList.add( "Card" );
		ELEMENT.classList.add( "CardSmooth" );
		ELEMENT.appendChild( this.e_body );
	}

/* GetValue */ M68 () {
		return this.#p43;
	}
	
/* GetSuit */ M77 () {
		return this.#p51;
	}
	
/* GetColor */ M69 () {
		return this.#p44;
	}

/* SetSize */ M76 ( width, height ) {
		super.M76( width, height );
		this.e_value.style.fontSize = Math.round( width * 0.3 ) + "px";
		if ( this.e_value.children.length ) {
			this.e_value.children[ 1 ].style.fontSize = Math.round( width * 0.2 ) + "px";
		}
		this.e_suit.style.fontSize = Math.round( width * 0.4 ) + "px";
		const img = g12( "img", this.e_suit );
		if ( img !== null ) {
			img.style.width = img.style.height = Math.round( width * 0.75 ) + "px";
		}
	}

/* SetFaceUp */ M60 ( status ) {
		this.#p32 = status;
		this.e_body.classList[ status ? "remove" : "add" ]( "FaceDown" );
	}
	
/* SetSelected */ M39 ( status ) {
		this.#p23 = status;
		this.e_body.classList[ status ? "add" : "remove" ]( "CardSelected" );
	}
	
/* ToggleSelected */ M16 () {
		this.M39( ! this.#p23 );

		return this.#p23;
	}
	
/* SetLocation */ M40 ( entity ) {
		

		this.#p24 = entity;
	}
	
/* IsAt */ M94 ( entity ) {
		

		return ( this.#p24 === entity );
	}
	
/* GetLocation */ M41 () {
		return this.#p24;
	}
	
/* IsRoyal */ M78 () {
		return [ k14, k7, k15 ].includes( this.#p43 );
	}

/* IsFaceCard */ M50 () {
		return this.M78();
	}
	
/* IsJoker */ M79 () {
		return ( this.#p43 === k6 );
	}
	
/* IsAce */ M91 () {
		return ( this.#p43 === k19 );
	}
	
/* IsFaceUp */ M70 () {
		return this.#p32;
	}
	
/* IsSelected */ M51 () {
		return this.#p23;
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
		return ( this.#p51 === k4 || this.#p51 === k3 );
	}

/* IsBlack */ M80 () {
		return ( this.#p51 === k5 || this.#p51 === k11 );
	}

/* IsHearts */ M71 () {
		return ( this.#p51 === k4 );
	}
	
/* IsDiamonds */ M52 () {
		return ( this.#p51 === k3 );
	}
}

"use strict;"

/* CardGame */
class C2 {

/* #viewport */ #p25 = null;
/* #messenger */ #p16 = null;
/* #menu */ #p52 = null;
/* #deck */ #p53 = null;
/* #busy */ #p54 = false;

/* #draw */ #p55 = null;
/* #card_piles */ #p11 = null;
/* #dungeon */ #p33 = null;
/* #discard */ #p34 = null;
/* #hand */ #p56 = null;
/* #stats */ #p45 = null;

/* #can_heal */ #p26 = true;
/* #last_run */ #p27 = -1;
/* #round */ #p46 = 0;
/* #game_over */ #p17 = false;
	
	constructor () {
		this.clicked_card = null; 

		A0.f23( this.#P28.bind( this ), this.#P31.bind( this) );
		A0.f7();

		this.#P21();
		
		this.#p25 = g14( "GameViewport" );
		this.#p16 = new C1( k17 );
		this.#p52 = new C5( g14( "MenuPannel" ), g14( "MenuIcon" ) );
		this.#p53 = new C4( k18 );

		this.#p11 = new E2( "CardPiles" );
		this.#p55 = this.#p11.M48();
		this.#p34 = this.#p11.M24();
		this.#p33 = new E1( "Dungeon", k2 );
		this.#p56 = new E1( "Hand", Infinity );
		this.#p45 = new C3( g14("InGameInfo"), k10, k9 );
		
 g14( "Play" ).appendChild( this.#p16.M49() );
		this.#p25.appendChild( this.#p33.M49() );
		this.#p25.appendChild( this.#p56.M49() );
 g6( this.#p25, this.#p11.M45() );
		
		A0.f6(
			window, "contextmenu", A0.f12.bind(A0)
		);
		A0.f0(
 g14( "HomeCard" ), null
		);
		A0.f0(
 g14( "MenuIcon" ), null
		);
		this.#p52.M45().forEach(
			e => A0.f0( e, null )
		);

		A0.f0(
			this.#p55.M15(), this.#p55
		);
		A0.f0(
			this.#p34.M15(), this.#p34
		);
		this.#p56.M32( true );
		A0.f0(
			this.#p56.M15(), this.#p56
		);

		this.#p52.M96();
		this.#P28( 0, 0 );
		this.#P25();

 g14( "AppViewport" ).classList.remove( "AppInit" );

		this.#P32();

		const PAGE = g3( "goto", null );
		if ( PAGE !== null ) {
			A0.f20( PAGE );
			this.#p52.M74( true );
		}
	}

/* #Debug */ #P32 () {
		
		this.Deck = this.#p53;
		this.Draw = this.#p55;
		this.Discard = this.#p34;
		this.Dungeon = this.#p33;
		this.Hand = this.#p56;
		this.Menu = this.#p52;
		this.Messenger = this.#p16;
		this.Stats = this.#p45;
	}

/* #InitOptions */ #P21 () {
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

/* #InitCards */ #P25 () {
		this.#p53.M33(
			card => {
				return card.M79()
				|| (
					card.M69() === k20
					&& ( card.M68() > REDS_MAX )
				)
			}
		);

		var card;

		while ( ( card = this.#p53.M84() ) !== null ) {
			this.#p25.appendChild( card.M49() );
			A0.f0( card.M15(), card );
			
			this.#p34.M81( card );
		}
	}

/* #onResize */ #P28 ( width, height ) {
		const SPACING = this.#p25.offsetTop;
		const WIDTH = this.#p25.offsetWidth;

		const CELL_WIDTH = Math.round( WIDTH / 6 );
		const CELL_HEIGHT = Math.round( this.#p25.offsetHeight / 4 );

		const [ CARD_WIDTH, CARD_HEIGHT ] = this.#P18( CELL_WIDTH, CELL_HEIGHT, SPACING );

		this.#p53.M35( CARD_WIDTH, CARD_HEIGHT );

		this.#p16.f18(
			WIDTH, Math.round( CARD_HEIGHT / 2),
			0, this.#p25.offsetLeft
		);

		this.#p11.f18(
			WIDTH, CELL_HEIGHT,
			0, 0,
			CARD_WIDTH, CARD_HEIGHT
		);

		this.#p33.f18(
			WIDTH, CELL_HEIGHT,
			CELL_HEIGHT, 0
		);

		this.#p56.f18(
			WIDTH, CELL_HEIGHT,
			2 * CELL_HEIGHT, 0
		);

		this.#p45.f18( WIDTH, CELL_HEIGHT - SPACING );
	}

/* #CalcCardSize */ #P18 ( cell_width, cell_height, spacing ) {
		const K = 1 * spacing;
		var card_width = cell_width - K;
		var card_height = Math.round( card_width * k1 );
		
		if ( card_height > cell_height - K ) {
			card_height = cell_height - K;
			card_width = Math.round( card_height / k1 );
		}

		return [ card_width, card_height ];
	}

/* #MoveGroupOfCards */ #P9 ( time_factor, nr_cards, fn ) {
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
		

		return this.#P9(
			0.5,
			Math.min( nr_cards, draw_pile.M53() ),
			_ => {
				card_row.M81( draw_pile.M20(), to_end );
			}
		);
	}

/* #DiscardRemainingCards */ #P6 () {
		this.#p53.M44( card => card.M62( false ) );
		
		this.#p55.M12( this.#p34 );
		this.#p33.M55( this.#p34 );
		this.#p56.M55( this.#p34 );
		
		setTimeout(
			_ => this.#p53.M44( card => card.M62( true ) ),
			0
		);
	}

/* #SendCardsToPile */ #P11 ( lst_cards, target_pile ) {
		

		var card;

		while ( lst_cards.length > 0 ) {
			card = lst_cards.pop();
			
			card.M41().M54( card );
			target_pile.M81( card );
		}
	}

/* #MakeDrawPile */ #P19 () {
		this.#P11( this.#p53.M4(), this.#p55 );
	}

/* #Warn */ #P34 ( txt ) {
		this.#p16.M46( txt );
	}

/* #onClick */ #P31 ( js_entity, evt_target ) {
		if ( this.#p52.IsIcon( evt_target ) ) {
			return this.#P12( evt_target.id.split( "_" ).pop() );
		}
		if ( evt_target.id === "HomeCard" ) {
			return this.#P12( "Play" );
		}

		if ( this.#p54 ) {
			
			return;
		}
		if ( this.#p17 ) {
			
			return;
		}

		if ( js_entity instanceof E4 ) {
			this.#P22( js_entity );
		} else if ( js_entity instanceof E0 ) {
			this.#P13( js_entity );
		} else if ( js_entity === this.#p56 ) {
			this.#P23();
		} else {
			
			if ( js_entity === this.#p33 ) {
				this._NewDungeon();
			}
		}
	}

/* #onClickMenuIcon */ #P12 ( id ) {
		if ( id === "MenuIcon" ) {
			this.#p52.M88();
		} else if ( id === "Play" ) {
			if ( A0.f4() === "Play" ) {
				this.#P33();
			} else {
				this.#p52.M74( true );
				this.#p52.M95();
				A0.f20( "Play" );
			}
		} else if ( id === "Home" ) {
			this.#p52.M96();
			this.#p52.M74( false );
			A0.f20( "Home" );
		} else {
			A0.f20( id );
		}
	}

/* #onClickCard */ #P22 ( card ) {
		
		
		this.clicked_card = card; 

		if ( this.#p54 ) {
			
			return;
		}

		if ( ! card.M70() ) {
			this.#P13( card.M41() );
		} else if ( card.M94( this.#p56 ) ) {
			this.#P23();
		} else if ( card.M80() ) {
			this.#P15( card );
		} else if ( card.M71() ) {
			this.#P16( card );
		} else {
			this.#P17( card );
		}
	}

/* #onClickCardPile */ #P13 ( card_pile ) {
		

		if ( this.#p54 ) {
			
			return;
		}

		if ( card_pile === this.#p34 ) {
			this.#P14();
		} else {
			this.#P35();
		}
	}

/* #onClickHand */ #P23 () {
		

		const card = this.#p33.M13();
		if ( card !== null ) {
			this.#p33.M0();
			const status = this.#p56.M43( card );
			if ( status !== 0 ) {
				if ( status === 1 ) {
					this.#P34( "Hand &raquo; First card must be a weapon." );
				} else if ( status === 2 ) {
					this.#P34( "Hand &raquo; Card must be a monster." );
				} else if ( status < 0 ) {
					this.#P34( "Hand &raquo; Monster value must be &lt; " + Math.abs( status ) );
				} else {
					
				}
			} else {
				this.#P7( card, this.#p56 );
				if ( card.M80() ) {
					
					const DAMAGE = this.#p56.M21() - card.M68();
					if ( DAMAGE < 0 ) {
						if ( this.#p45.M36( DAMAGE ) === 0 ) {
							this.#P30( false );
						}
					} else {
						this.#p45.M2();
					}
				}
			}
		} else {
			if ( this.#p56.M53() === 0 ) {
				this.#P34( "Hand &raquo; Select a weapon from the dungeon." );
			} else {
				this.#P34( "Hand &raquo; Select a monster from the dungeon." );
			}
		}

		this.#p56._Status();
	}
	
/* #onClickMonster */ #P15 ( card ) {
		
		this.#p33.M56( card );
		
		if ( this.#p56.M53() === 0 ) {
			this.#P14();
		} else if ( card.M68() >= this.#p56.M57() ) {
			this.#P14();
		}
	}
	
/* #onClickPotion */ #P16 ( card ) {
		

		if ( this.#p26 ) {
			this.#p26 = false;
			this.#p45.M85( false );
			this.#p45.M36( card.M68() );
		} else {
			this.#p45.M2();
		}

		this.#P7( card, this.#p34 );
	}
	
/* #onClickWeapon */ #P17 ( card ) {
		

		this.#p54 = true;

		this.#p45.M2();

		this.#P9(
			0.33,
			this.#p56.M53(),
			() => {
				this.#p34.M81( this.#p56.M22() );
			}
		).then(
			() => {
				this.#P7( card, this.#p56 );
				this.#p54 = false;
				this.#p56._Status();
			}
		);
	}

/* #Start */ #P33 () {
		

		if ( this.#p54 ) {
			
			return;
		}
		
		this.#p54 = true;
		this.#p52.M96();
		this.#p16.M96();
		this.#p52.M58( false );
		this.#p45.M93();

		this.#p26= true;
		this.#p27 = -1;
		this.#p46 = 0;
		this.#p17 = false;

		this.#P6();

		this.#p53.M93();
		this.#p53.M83();

		this.#P19();
		

		this.#p55.M73( k0 );
		this.#p34.M73( k0 );

		this.#P8(
			this.#p55, this.#p33, k2, false
		).then(
			() => {
				this.#p33.M65();
				
				this.#p52.M58( true );
				this.#p54 = false;
			}
		);
	}

/* #RemoveCardFromDungeon */ #P7 ( card, target ) {
		
		

		this.#p33.M54( card );
		target.M81( card );

		this.#p45.M89( false );

		if ( this.#p33.M53() > 1 ) {
			return;
		}

		if ( this.#p33.M53() === 0 ) {
			
			this.#P30( true );
			return;
		}

		if ( this.#p55.M53() === 0 ) {
			
			return;
		}

		this.#P29();
	}
	
/* #NewRound */ #P29 () {
		this.#p46 += 1;

		

		this.#p54 = true;

		this.#p26 = true;
		this.#p45.M85( true );
		this.#p45.M89( this.#p46 - this.#p27 > 1 );

		this.#P8(
			this.#p55,
			this.#p33,
 k2 - this.#p33.M53(),
			false
		).then(
			() => {
				this.#p33.M65();
				this.#p54 = false;
			}
		);
	}

/* #FightBarehanded */ #P14 () {
		const card = this.#p33.M13();
		if ( card === null ) {
			this.#P34( "Fight barehanded &raquo; Select a monster from the dungeon." );
		} else {
			this.#P7( card, this.#p34 );
			if ( this.#p45.M36( - card.M68() ) === 0 ) {
				this.#P30( false );
			}
		}
	}

/* #Run */ #P35 () {
		if ( this.#p27 >= 0 && this.#p46 - this.#p27 <= 1 ) {
			this.#P34( "Run &raquo; No two consecutive rooms can be avoided." );
			return;
		}

		if ( this.#p33.M53() < k2 ) {
			this.#P34( "Run &raquo; Not possible after playing cards." );
			return;
		}

		this.#p27 = this.#p46;
		this.#p45.M89( false );
		this.#p54 = true;

		this.#P9(
			0.33,
 k2,
			() => {
				this.#p55.M10( this.#p33.M22() );
			}
		).then(
			() => {
				this.#p54 = false;
				this.#P29();
			}
		);
	}

/* #GameOver */ #P30 ( win ) {
		this.#p17 = true;
		var score = 0;
		if ( ! win ) {
			this.#p55.M6(
				card => card.M80()
			).forEach(
				card => score -= card.M68()
			);
		} else {
			score = this.#p45.M66();
			this.#p55.M6(
				card => card.M71()
			).forEach(
				card => score += card.M68()
			);
		}
		this.#p16.M47( "Game over &raquo; You scored " + score + "." );
	}
}

"use strict;"

/* CardPile */
class E0 extends E3 {
/* #id */ #p61 = null;
/* #lst_cards */ #p18 = [];
/* #delay */ #p47 = 0;
/* #top_card_face */ #p4 = false;
/* #base */ #p57 = null;
/* #e_counter */ #p19 = null;

	constructor ( id ) {
		super( id, "column", "center", "center", true );

		this.#p61 = id;

		this.#p57 = new C0( this.#p61 + "_Base", true );
		this.M59( this.#p57 );

		const E_BASE = this.#p57.M49();
		E_BASE.classList.add( "CardPileBase" );
		E_BASE.classList.add( "Clickable" );

		this.#p19 = document.createElement( "p" );
		this.#p19.classList.add( "Hidden" );
		E_BASE.appendChild( this.#p19 );
	}

/* GetBaseElement */ M17 () {
		return this.#p57.M49();
	}

/* GetCards */ M72 () {
		return g8( this.#p18 );
	}

/* SetTopCardFace */ M18 ( status ) {
		this.#p4 = status;
		if ( this.#p18.length > 0 ) {
			this.#p18[ this.#p18.length - 1 ].M60( status );
		}
	}

/* UpdateEntities */ M19 ( card_width, card_height ) {
		this.M7( card_width, card_height );
		this.M1();
		this.#P10();
		this.#p19.style.fontSize = Math.round( card_width * 0.09 ) + "px";
	}

/* #SetCardsPosition */ #P10 () {
		const [ TOP, LEFT ] = this.#p57.M37();
		this.#p18.forEach(
			card => card.M38( TOP, LEFT )
		);
	}

/* SetCardsIndex */ M26 () {
		var z = 1;
		this.#p18.forEach(
			card => card.M63( z ++ )
		);
	}

/* SetDelay */ M73 ( value ) {
		this.#p47 = value;
	}
	
/* AddCardToTop */ M30 ( card ) {
		this.M81( card, true );
	}
	
/* AddCardToBottom */ M10 ( card ) {
		this.M81( card, false );
	}
	
/* AddCard */ M81 ( card, to_top = true ) {
		

		if ( this.#p18.includes( card) ) {
			return 
		}

		this.#p18[ to_top ? "push" : "unshift" ]( card );
		this.#p19.innerHTML = this.#p18.length;
		
		const [ TOP, LEFT ] = this.#p57.M37();
		card.M39( false );
		card.M60( false );
		card.M38( TOP, LEFT );
		if ( to_top ) {
			card.M63( 100 + this.#p18.length );
		} else {
			card.M63( 0 );
		}
		card.M40( this );

 g15( this.#p47 ).then(
			_ => {
				this.M26();
				this.M3();
			}
		);
	}

/* GetBasePosition */ M11 () {
		return this.#p57.M37();
	}

/* GetCardFromTop */ M20 () {
		if ( this.#p18.length === 0 ) {
			
			return null;
		}

		const CARD = this.#p18.pop();
		CARD.M63( 100 + this.#p18.length );
		CARD.M61( false );
		this.M3();
		this.#p19.innerHTML = this.#p18.length;

		return CARD;
	}

/* HideAllButTopCard */ M3 () {
		var idx = this.#p18.length - 1;

		if ( idx >= 0 ) {
			var card = this.#p18[ idx ];
			card.M61( false );
			card.M60( this.#p4 );
			for ( -- idx; idx >= 0; -- idx ) {
				card = this.#p18[ idx ];
				card.M61( true );
				card.M60( false );
			}
		}
	}

/* IsEmpty */ M82 () {
		return ( this.#p18.length === 0 );
	}
	
/* GetNrCards */ M53 () {
		return this.#p18.length;
	}

/* RemoveCard */ M54 ( card ) {
		

		if ( ! this.#p18.includes( card) ) {
			return 
		}

 g2( this.#p18, card );
		card.M61( false );
		this.#p19.innerHTML = this.#p18.length;
		this.M3();

		return card;
	}

/* ShowCounter */ M42 ( status ) {
		this.#p19.classList[ status ? "remove" : "add" ]( "Hidden" );
		if ( status ) {
			this.#p19.innerHTML = this.#p18.length;
		}
	}

/* SendCardsToPile */ M12 ( card_pile ) {
		

		var card;
		while ( this.#p18.length > 0 ) {
			card = this.#p18[ 0 ];
			this.M54( card );
			card_pile.M81( card );
		}
	}

/* GetClickTarget */ M15 () {
		return this.#p57.M49();
	}

/* ShuffleCards */ M31 () {
		if ( this.#p18.length > 1 ) {
 g7( this.#p18 );
			this.M26();
			this.M3();
		}
	}

/* Highlight */ M64 ( status ) {
		this.M49().classList[ status ? "add" : "remove" ]( "Highlight" );
	}

/* GetFilteredCards */ M6 ( fn ) {
		return this.#p18.filter( fn );
	}

}

"use strict;"

/* CardsRow */
class E1 extends E3 {
/* #id */ #p61 = null;
/* #max_cards */ #p20 = 0;
/* #lst_cards */ #p18 = [];
/* #is_hand */ #p35 = false;
/* #selected_card */ #p5 = null;
/* #weapon */ #p39 = 0;
/* #monster */ #p36 = Infinity;
	
	constructor ( id, max_cards ) {
		super(
			id,
			"row",
			isNaN( parseInt( max_cards, 10 ) ) ? "center" : "evenly",
			"center",
			true
		);

		this.#p61 = id;
		this.#p20 = max_cards;
		this.#p35 = isNaN( parseInt( max_cards, 10 ) );
	}

/* IsHand */ M87 () {
		return this.#p35;
	}

/* onResize */ f18 ( width, height, top, left ) {
		super.f18( width, height, top, left );
	}

/* SetClickable */ M32 ( status ) {
		this.M49().classList[ status ? "add" : "remove "]( "Clickable" );
	}
	
/* GetClickTarget */ M15 () {
		return this.M49();
	}

/* AddCard */ M81 ( card, to_end = true ) {
		

		if ( this.#p18.length === this.#p20 ) {
			return 
		}
		if ( this.#p18.includes( card) ) {
			return 
		}

		card.M40( this );
		card.M60( true );
		card.M63( 100 + this.#p18.length );

		if ( to_end ) {
			
			
			if ( card.M52() ) {
				this.#p39 = card.M68();
			} else if ( card.M80() ) {
				this.#p36 = card.M68();
			}

			this.#p18.push( card );
		} else {
			
			this.#p18.unshift( card );
		}
		this.M59( card, to_end );

		return true;
	}

/* RemoveCard */ M54 ( card ) {
		

		if ( ! this.#p18.includes( card ) ) {
			return 
		}
		
 g2( this.#p18, card );
		this.M28( card );

		if ( card === this.#p5 ) {
			card.M39( false );
			this.#p5 = null;
		}

		if ( this.#p35 && this.#p18.length === 0 ) {
			this.#p39 = 0;
			this.#p36 = Infinity;
		}

		return card;
	}

/* ClearCards */ M55 ( card_pile ) {
		
		
		var card;
		while ( this.#p18.length > 0 ) {
			card = this.#p18[ 0 ];
			this.M54( card );
			card_pile.M81( card );
		}

		if ( this.#p35 ) {
			
			this.#p39 = 0;
			this.#p36 = Infinity;
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

/* GetSelectedCard */ M13 () {
		

		return this.#p5;
	}

/* UnselectSelectedCard */ M0 () {
		

		if ( this.#p5 !== null ) {
			this.#p5.M39( false );
			this.#p5 = null;
		}
	}

/* GetNrCards */ M53 () {
		return this.#p18.length;
	}

/* GetCards */ M72 () {
		return g8( this.#p18 );
	}

	_Status () {
		
		
	}

/* TestAddCard */ M43 ( card ) {
		

		if ( this.#p18.length === 0 ) {
			if ( ! card.M52() ) {
				return 1;
			}
		} else {
			
			if ( ! card.M80() ) {
				return 2;
			} else if ( card.M68() >= this.#p36 ) {
				return ( - this.#p36 );
			}
		}

		return 0;
	}

/* GetMonster */ M57 () {
		return this.#p36;
	}

/* GetWeaponValue */ M21 () {
		
		
		return this.#p39;
	}
	
/* RemoveLastCard */ M22 () {
		
		return this.M54(
			this.#p18[ this.#p18.length - 1 ]
		);
	}

/* SortCards */ M65 () {
		this.M8(
			lst => {
				this.#p18 = lst.sort(
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
				return g8( this.#p18 );
			}
		);
		this.M1();
	}
}

"use strict;"

/* Deck */
class C4 {
/* #lst_cards */ #p18 = [];
/* #lst_cards_out */ #p6 = [];
/* #nr_jokers */ #p21 = 0;
/* #total_cards */ #p10 = 0;
	
	constructor ( nr_jokers, discard_fn = null ) {
		this.#p21 = nr_jokers;

		this.#P26();

		if ( discard_fn !== null ) {
			this.DiscardCards ( discard_fn );
		}
	}

/* #MakeCards */ #P26 () {
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
					{ id: suit, symbol: this.M27( suit ), color: color },
					{ nr: value, symbol: this.M23( value ) }
					);
					this.#p18.push( card );
					this.#p10 += 1;
			}
		}
		var idx_color = 0, n;
		for ( n = 1; n <= this.#p21; ++ n ) {
			card = new E4(
				id ++,
				{ id: k12, symbol: this.M27( k12 ), color: LST_COLORS[ idx_color ] },
				{ nr: k6, symbol: this.M23( k6 ) }
			);
			
			this.#p18.push( card );
			this.#p10 += 1;

			idx_color = ( 1 + idx_color ) % LST_COLORS.length;
		}
	}

/* DiscardCards */ M33 ( fn ) {
		if ( this.#p6.length > 0 ) {
			
			return;
		}

		const lst_cards = this.#p18.filter( fn );

		

		this.#p10 -= lst_cards.length;
		
		lst_cards.forEach(
			card => {
 g2( this.#p18, card );
			}
		)

		

		return lst_cards;
	}

/* onResize */ f18 ( card_width, card_height ) {
		this.M44( card => card.M76( card_width, card_height ) );
	}

/* ForEachCard */ M44 ( fn ) {
		this.#p18.forEach( fn );
		this.#p6.forEach( fn );
	}

/* Shuffle */ M83 () {
 g7( this.#p18 );
	}

/* GetCard */ M84 () {
		if ( this.#p18.length === 0 ) {
			return null;
		}

		const CARD = g0( this.#p18 );
		this.#p6.push( CARD );
		
		return CARD;
	}

/* Reset */ M93 () {
		while ( this.#p6.length ) {
			this.#p18.push( this.#p6.pop() );
		}

		
	}

/* GetSuitSymbol */ M27 ( suit ) {
		return k21.filter( data => data.id === suit ).pop().symbol;
	}
	
/* GetSuitColor */ M34 ( suit ) {
		return k21.filter( data => data.id === suit ).pop().color;
	}
	
/* GetValueSymbol */ M23 ( value ) {
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
		const lst_cards = this.#p18.filter( fn );
		
		lst_cards.forEach(
			card => {
 g2( this.#p18, card );
				this.#p6.push( card );
			}
		)

		return lst_cards;
	}

/* GetNrCards */ M53 () {
		return this.#p18.length;
	}

/* GetNrTotalCards */ M14 () {
		return this.#p10;
	}

/* GetRemainingCards */ M4 () {
		const lst_cards = [];
		var card;

		while ( this.#p18.length > 0 ) {
			var card = this.#p18.pop();
			this.#p6.push( card );
			lst_cards.push( card );
		}

		return lst_cards;
	}

}

/* Menu */
class C5 {
/* #element */ #p30 = null;
/* #icon */ #p58 = null;
	#lst_elements =null;

    constructor  ( element, icon ) {
        this.#p30 = element;
        this.#p58 = icon;

		this.#lst_elements = Array.from( element.children );
		
		this.#p58.classList.add( "Clickable" );

		this.#lst_elements.forEach(
			e => e.classList.add( "Clickable" )
		);
    }

/* GetElements */ M45 () {
		return g8( this.#lst_elements );
	}

/* Show */ M95 () {
		this.#p30.style.right = 0;
	}
    
/* Hide */ M96 () {
		this.#p30.style.right = ( -1.1 * this.#p30.offsetWidth ) + "px"
	}
    
/* Toggle */ M88 () {
		this.#p30.style.right === "0px"
			? this.M96()
			: this.M95();
	}

/* ShowIcon */ M74 ( status = true ) {
		this.#p58.classList[ status ? "remove" : "add" ]( "Hidden" );
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
/* #element */ #p30 = null;
/* #txt */ #p60 = null;
/* #show_time */ #p22 = 0;
/* #timer */ #p48 = 0;
	
	constructor ( show_time ) {
		this.#p30 = document.createElement( "div" );
		this.#p30.id = "Messenger";
		this.#p60 = document.createElement( "p" );
		this.#p30.appendChild( this.#p60 );

		this.#p22 = ( show_time < 1E3 ? 1E3 * show_time : show_time );
	}

/* GetElement */ M49 () {
		return this.#p30;
	}

/* onResize */ f18 ( width, height, top, left ) {
		this.#p30.style.width = width + "px";
		this.#p30.style.height = height + "px";
		this.#p30.style.left = left + "px";
		
		this.#p60.style.fontSize = Math.min(
			Math.round( height * 0.25 ),
			17
		) + "px";

		this.M96();
	}

/* Hide */ M96 () {
		this.#p30.style.top = ( - 1.1 * this.#p30.offsetHeight ) + "px";
	}
	
/* ShowPrefixMessage */ M5 ( prefix, message ) {
		if ( this.#p22 > 0 ) {
			this.M46( "<span>" + prefix + "</span>: " + message );
		}
	}

/* ShowMessage */ M46 ( message ) {
		if ( this.#p22 > 0 ) {
			clearTimeout( this.#p48 );
			this.#p48 = setTimeout( this.M96.bind( this ), this.#p22 );
			this.#p60.innerHTML = message;
			this.#p30.style.top = 0;
		}
	}
	
/* ShowForever */ M47 ( message ) {
		clearTimeout( this.timer );
		this.#p60.innerHTML = message;
		this.#p30.style.top = 0;
	}

}

"use strict;"

/* PilesRow */
class E2 extends E3 {
/* #id */ #p61 = null;
/* #draw */ #p55 = null;
/* #discard */ #p34 = null;
	constructor ( id ) {
		super( "PilesRow_" + id, "row", "evenly", "center", true );

		this.#p61 = id;
		this.#p55 = new E0( id + "_Draw" );
		this.#p34 = new E0( id + "_Discard" );

		this.#p34.M42( true );
		this.#p55.M42( true );

		this.M59( this.#p55 );
		this.M59( this.#p34 );
	}

/* onResize */ f18 ( width, height, top, left, card_width, card_height ) {
		super.f18( width, height, top, left );
		this.M7( Math.min( Math.round( width / 3 ), height), height );
		this.M1();

		this.M25(
			e => {
				if ( e instanceof E0 ) {
					e.M19( card_width, card_height );
				} else {
					
					e.M49().style.fontSize = Math.round( card_width * 0.12 ) + "px";
				}
			}
		);
	}

/* GetDrawPile */ M48 () {
		return this.#p55;
	}

/* GetDiscardPile */ M24 () {
		return this.#p34;
	}

/* GetElements */ M45 () {
		return [
			this.M49(),
			this.#p55.M49(),
			this.#p34.M49(),
			this.#p55.M17(),
			this.#p34.M17()
		];
	}

}

/* Stats */
class C3 {
/* #element */ #p30 = null;

/* #health */ #p40 = 0;
/* #e_health */ #p28 = null;
/* #e_health_left */ #p7 = null;
/* #e_health_right */ #p2 = null;
/* #e_health_update */ #p1 = null;
/* #MIN_HEALTH */ #p12 = 0;
/* #MAX_HEALTH */ #p13 = 0;
/* #txt_health */ #p14 = null;
/* #txt_run */ #p37 = null;
/* #txt_heal */ #p29 = null;
/* #display_health */ #p3 = 0;
/* #DELAY */ #p49 = 100;

    constructor  ( element, min_health, max_health ) {
        this.#p30 = element;
        this.#p12 = min_health;
        this.#p13 = max_health

        element.appendChild( this.#p7 = this.#P27( "HealthLeft" ) );
        this.#p28 = document.createElement( "div" );
        this.#p28.id = "Health";
        element.appendChild( this.#p28 );
        element.appendChild( this.#p2 = this.#P27( "HealthRight" ) );
        this.#p14 = document.createElement( "div" );
        this.#p14.innerHTML = "--";
        this.#p28.appendChild( this.#p14 );
        this.#p1 = document.createElement( "div" );
        this.#p28.appendChild( this.#p1 );
        const div = document.createElement( "div" );
        this.#p28.appendChild( div );
        this.#p37 = document.createElement( "span" );
        this.#p37.innerHTML = "&larr;";
        this.#p37.innerHTML = "&#x25C0;";
        this.#p29 = document.createElement( "span" );
        this.#p29.innerHTML = "&uarr;";
        this.#p29.innerHTML = "&#x25B2;";
        div.appendChild( this.#p37 );
        div.appendChild( this.#p29 );
    }

/* Reset */ M93 () {
        this.#p40 = this.#p3 = this.#p13;
        this.#p1.innerHTML = "";
        
        this.M85( true );
        this.M89( true );
        this.#P24();
    }
    
/* ClearHealthUpdates */ M2 () {
        this.#p1.innerHTML = "";
    }

/* #MakeGauge */ #P27 ( id ) {
        const div = document.createElement( "div" );
        div.id = id;
        const e = document.createElement( "div" );
        div.appendChild( e );
		return div;
	}

/* onResize */ f18 ( width, height ) {
        this.#p30.style.height = height + "px";
        const FS1 = Math.round( width * 0.4 * 0.09 );
        this.#p7.style.fontSize = FS1 + "px";
        this.#p2.style.fontSize = FS1 + "px";
	}

/* UpdateHealth */ M36 ( value ) {
        

        this.#p40 += value;
        this.#p1.innerHTML = ( value > 0 ? "+" : "" ) + value;
        
        if ( this.#p40 > this.#p13 ) {
            this.#p40 = this.#p13;
        } else if ( this.#p40 < this.#p12 ) {
            this.#p40 = this.#p12;
        }

        if ( this.#p3 !== this.#p40 ) {
            setTimeout(
                this.#p15.bind( this ),
                this.#p49
            );
        }

        return this.#p40;
    }

/* #StepHealth */ #p15 = function () {
        this.#p3 += Math.sign( this.#p40 - this.#p3 );
        this.#P24();

        if ( this.#p3 !== this.#p40 ) {
            setTimeout( this.#p15.bind( this ), this.#p49 );
        }
    }
    
/* #UpdateInfo */ #P24 () {
        this.#p14.innerHTML = this.#p3;
        const W = Math.floor( 100 * ( this.#p3 / this.#p13 ) );
 g12( "div", this.#p7 ).style.width = W + "%";
 g12( "div", this.#p2 ).style.width = W + "%";
    }

/* SetRun */ M89 ( status ) {
        this.#p37.classList[ status ? "remove" : "add" ]( "Disabled" );
    }

/* SetHeal */ M85 ( status ) {
        this.#p29.classList[ status ? "remove" : "add" ]( "Disabled" );
    }

/* GetHealth */ M66 () {
        return this.#p40;
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

