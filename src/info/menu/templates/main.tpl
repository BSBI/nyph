<li class="table-view-divider">Info</li>
<li class="table-view-cell">
  <a href="#info/about" class="navigate-right">
    <span class="media-object pull-left icon icon-info"></span>
    About
  </a>
</li>
<li class="table-view-cell">
  <a href="#info/help" class="navigate-right">
    <span class="media-object pull-left icon icon-help"></span>
    Help
  </a>
</li>
<li class="table-view-cell">
  <a href="#info/privacy" class="navigate-right">
    <span class="media-object pull-left icon icon-lock-closed"></span>
    Privacy Policy
  </a>
</li>
<li class="table-view-divider">Settings</li>
<li id="gps-enabled-btn-parent" class="table-view-cell">
  Use GPS
  <span class="media-object pull-left icon icon-location"></span>
  <div id="gps-enabled-btn" data-setting="gpsEnabled"
       class="toggle no-yes <%- obj.gpsEnabled ? 'active' : '' %>">
    <div class="toggle-handle"></div>
  </div>
</li>
<li class="table-view-cell">
  <a id="app-reset-btn">
    <span class="media-object pull-left icon icon-undo"></span>
    Start a new list
  </a>
</li>
