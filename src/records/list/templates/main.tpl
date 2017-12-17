<% if (window.nyphAdminMode) { %>
<div class="info-message"><p><strong>admin mode</strong></p>
    <p>Use admin mode to transcribe lists sent by other recorders.  Lists are distinguished by recorder name, which must be set while in admin mode (lock the recorder field to avoid typing the name each time). Records entered while in admin mode are assigned to the generic plant hunt iRecord user account, so the system cannot automatically acknowedge receipt of the records.  Please manually send an acknowledgement email to the contributer.</p>
</div>
<% } %>
<ul class="table-view core no-top">
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-address"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <input id="nyph-list-place" required class="validationsubject" type="text" placeholder="Where did you go?" name="nyph-list-place" value="<%= obj.nyphListPlacename %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
        <p class="validationmessage">Please tell us where you surveyed.</p>
      </label>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-user-plus"></span>
    <label class="pull-left " style="margin: 0px; padding: 0px;">
      <input id="nyph-list-recorders" required class="validationsubject" type="text" placeholder="Who went?" name="nyph-list-recorders" value="<%= obj.nyphListRecorders %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
      <p class="validationmessage">Please let us know who took part in your Plant Hunt.</p>
    </label>
  </li>
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-mail"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <input id="nyph-list-email" type="email" class="validationsubject" placeholder="Email address (optional)" name="nyph-list-email" value="<%= obj.nyphListEmail %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;position: absolute; left: 60px; right: 12px;">
        <p class="validationmessage">Email address appears to be invalid.</p>
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
