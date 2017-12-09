<div class="info-message">
  <p>Edit the fields by clicking on the rows below. Click the back icon (<) when you have finished.</p>
</div>
<ul class="table-view core inputs no-top">
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-comment"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <input id="nyph-list-title" type="text" placeholder="List name" name="nyph-list-title" value="<%= obj.nyphListTitle %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;">
      </label>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-calendar"></span>
    <label class="pull-left " style="margin: 0px; padding: 0px;">
      <input id="nyph-list-date" type="date" title="The 2018 BSBI Plant New Year Hunt runs from the 30th December to 6th January. Please don't use the app for new field records afterwards." name="nyph-list-date" value="<%- obj.date %>" max="<%- obj.maxDate %>" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;">
    </label>
  </li>
  <li class="table-view-cell">
      <span class="media-object pull-left icon icon-comment"></span>
      <label class="pull-left " style="margin: 0px; padding: 0px;">
        <textarea id="nyph-list-comments" type="text" placeholder="Comments" name="nyph-list-comments" style="margin: 0px; padding: 0px;text-align: left; border: none; height: inherit; font-size: inherit;"><%= obj.nyphListComments %></textarea>
      </label>
  </li>
</ul>
