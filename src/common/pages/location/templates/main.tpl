<div id="header-controls">
  <div id="back-btn" class="pull-left">
    <a data-rel="back" title="return to the main screen (the list of records)" class="icon icon-left-nav" style="color: white;"></a>
  </div>
  <div class="input-group" style="width: 90%;">
    <div class="input-row">
      <button id="location-lock-btn" class="lock-btn icon icon-lock-<%- obj.locationLocked ? 'closed' : 'open' %>"></button>
      <label class="media-object pull-left icon icon-location" for="location-gridref" />
      <input type="text" title="set gridreference" id="location-gridref" placeholder="Grid reference" value="<%- obj.gridref %>" data-source="<%- obj.locationSource %>" />
    </div>
  </div>
</div>
<div id="map-container">
  <div id="map"></div>
</div>
