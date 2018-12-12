<ul class="table-view core no-top">
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-address"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <input id="nyph-list-place" required class="validationsubject" type="text" placeholder="Where did you go?" name="nyph-list-place" value="<%= obj.nyphListPlacename %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
        <p class="validationmessage"><br>Please tell us where you surveyed.</p>
      </label>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-user-plus"></span>
    <label class="pull-left " style="margin: 0px; padding: 0px;">
      <input id="nyph-list-recorders" required class="validationsubject" type="text" placeholder="Who went?" name="nyph-list-recorders" value="<%= obj.nyphListRecorders %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
      <p class="validationmessage"><br>Please let us know who took part in your Plant Hunt.</p>
    </label>
  </li>
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-user-plus"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <input id="nyph-list-no-recorders" required class="validationsubject" type="number" placeholder="How many people?" name="nyph-list-no-recorders" value="<%= obj.nyphListNoRecorders %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
        <p class="validationmessage"><br>Please let us know how many people took part in your Plant Hunt.</p>
      </label>
    </li>
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-mail"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <input id="nyph-list-email" type="email" class="validationsubject" placeholder="Email address" name="nyph-list-email" value="<%= obj.nyphListEmail %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
        <p class="validationmessage"><br>Email address appears to be invalid.</p>
      </label>
  </li>
  <li class="table-view-cell">
      <a href="#records/details" id="list-details-button" class="navigate-right">
        <span class="media-object pull-right descript" style="position: absolute; right: 0px;"><%= obj.details %></span>
        <span class="media-object pull-left icon icon-comment"></span>
        More&nbsp;details
      </a>
  </li>
</ul>
<div class="info-message">
  <p>Add entries by clicking on the (+) button (top-right corner) or use the camera icon to quickly add an entry with just a photo. When you have finished, send your records by clicking Send. To modify a record click on its row below.</p>
</div>
<ul id="records-list" class="table-view no-top"></ul>
