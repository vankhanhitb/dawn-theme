class AjaxPagination extends HTMLElement{
	constructor() {
		super();
		this.settings = {};
		this.defaultSettings = { 
			pagination: "#Scroll-Pagination", 
			method: "scroll", // Change to click if you want implement load more when user click 
			container: "#product-grid", 
			offset: 0, 
			loadingText: "Loading", 
			callback: null 
		};
		this.settings = Object.assign(this.defaultSettings, this.settings);
		this.addScrollListeners = this.addScrollListeners.bind(this);
		this.addClickListener = this.addClickListener.bind(this);
		this.checkIfPaginationInView = this.checkIfPaginationInView.bind(this);
		this.stopMultipleClicks = this.stopMultipleClicks.bind(this);
		this.destroy = this.destroy.bind(this);
		this.containerElement = document.querySelector(this.settings.container);
		this.paginationElement = document.querySelector(this.settings.pagination);
	}
    
	connectedCallback() {
		this.initialize();
	}

	initialize() {
		if (this.containerElement && this.paginationElement) {
			let initializers = { click: this.addClickListener, scroll: this.addScrollListeners };
			initializers[this.settings.method]();
		}
	}

	addScrollListeners() {
		document.addEventListener("scroll", this.checkIfPaginationInView);
		window.addEventListener("resize", this.checkIfPaginationInView);
		window.addEventListener("orientationchange", this.checkIfPaginationInView)
	}

	addClickListener() {
		this.nextPageLinkElement = this.paginationElement.querySelector("a");
		this.clickActive = true;
		this.nextPageLinkElement !== null ? this.nextPageLinkElement.addEventListener("click", this.stopMultipleClicks) : '';
	}

	stopMultipleClicks(event) {
		event.preventDefault();
		if(this.clickActive){
			this.nextPageLinkElement.innerHTML = this.settings.loadingText;
			this.nextPageUrl = this.nextPageLinkElement.href;
			this.clickActive = false;
			this.loadMore();
		}
	}

	checkIfPaginationInView() {
		let top = this.paginationElement.getBoundingClientRect().top - this.settings.offset;
		let bottom = this.paginationElement.getBoundingClientRect().bottom + this.settings.offset;
		if (top <= window.innerHeight && bottom >= 0){
			this.nextPageLinkElement = this.paginationElement.querySelector("a");
			this.removeScrollListener();
			if(this.nextPageLinkElement){
				this.nextPageLinkElement.innerHTML = this.settings.loadingText;
				this.nextPageUrl = this.nextPageLinkElement.href;
				this.loadMore();
			}
		}
	}

	loadMore() {
		this.request = new XMLHttpRequest();
		this.request.onreadystatechange = function () {
			if (this.request.readyState === 4 && this.request.status === 200) {
				let newContainer = this.request.responseXML.querySelectorAll(this.settings.container)[0];
				let newPagination = this.request.responseXML.querySelectorAll(this.settings.pagination)[0];
				this.containerElement.insertAdjacentHTML("beforeend", newContainer.innerHTML);
				this.paginationElement.innerHTML = newPagination.innerHTML;
				this.initialize();
				if( this.nextPageLinkElement != null ){
					console.log("Callback");
					this.initialize();
				}else{
					this.destroy();
				}
			}
		}.bind(this);
		this.request.open("GET", this.nextPageUrl);
		this.request.responseType = "document";
		this.request.send();
	}

	removeClickListener() {
		this.nextPageLinkElement?.addEventListener("click", this.stopMultipleClicks);
	}

	removeScrollListener() {
		document.removeEventListener("scroll", this.checkIfPaginationInView);
		window.removeEventListener("resize", this.checkIfPaginationInView);
		window.removeEventListener("orientationchange", this.checkIfPaginationInView);
	}

	destroy() {
		var destroyers = { click: this.removeClickListener, scroll: this.removeScrollListener };
		return destroyers[this.settings.method](), this;
	}

};

customElements.define('ajax-pagination', AjaxPagination)

document.addEventListener("DOMContentLoaded", function() {
	function callbackInfiniteScroll(){}
    // var endlessScroll = new AjaxPagination({
	// 		container: '#product-grid',
	// 		pagination: '#Scroll-Pagination',
	// 		method: 'scroll',
	// 		callback: callbackInfiniteScroll
	//    })
});