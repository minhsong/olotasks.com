import React, { useEffect } from "react";
import MemberIcon from "@mui/icons-material/PersonOutlineOutlined";
import LabelIcon from "@mui/icons-material/LabelOutlined";

import { Container, Title, TopLeftWrapper, TopRightWrapper } from "./style";
import Button from "../../../Components/ReUsableComponents/Button";
import BasePopover from "../../../Components/ReUsableComponents/BasePopover";
import MembersPopover from "../../../Components/Popovers/MembersPopover";
import { useDispatch, useSelector } from "react-redux";
import LabelsPopover from "../../../Components/Popovers/LabelsPopover";
import { CalendarMonth, FilterAlt, ViewColumn } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import DateRangePicker from "../../../Components/DateRangePicker";
import { differenceInDays } from "date-fns";
import { resetFilter, setFilter } from "../../../Redux/Slices/reportSlice";
import BaseSelectItems from "../../../Components/Popovers/BaseSelectItems";

export default ({ actionMenu, filterPanel }) => {
  const [memberPopover, setMemberPopover] = React.useState(null);
  const [labelPopover, setLabelPopover] = React.useState(null);
  const [dateRangePopover, setDatePopover] = React.useState(null);
  const [columnPopover, setColumnPopover] = React.useState(null);

  const dispatch = useDispatch();
  const board = useSelector((state) => state.board);
  const report = useSelector((state) => state.report);
  const allLists = useSelector((state) => state.list.allLists);

  const { reset, watch, getValues, setValue, register, handleSubmit } = useForm(
    {
      defaultValues: report.filter,
    }
  );

  const lableWatch = watch("labels");
  const memberWatch = watch("members");
  const dateRangeWatch = watch("dateRange");
  const columnsWatch = watch("columns");

  useEffect(() => {
    reset(report.filter);
  }, [report.filter]);

  const handleSubmitHandle = () => {
    dispatch(setFilter(getValues()));
  };

  const resetDefaultHandle = () => {
    reset();
    dispatch(resetFilter());
  };

  return (
    <Container>
      <TopLeftWrapper>{actionMenu}</TopLeftWrapper>
      <TopRightWrapper>
        <Title>
          <FilterAlt fontSize="small" /> Fillter:
        </Title>
        <Button
          color={columnsWatch.length > 0 ? "success" : "default"}
          onClick={(event) => setColumnPopover(event.currentTarget)}
        >
          <ViewColumn fontSize="small" /> Columns
          {columnsWatch.length > 0 && `(${columnsWatch.length})`}
        </Button>
        <Button
          color={memberWatch.length > 0 ? "success" : "default"}
          onClick={(event) => setMemberPopover(event.currentTarget)}
        >
          <MemberIcon fontSize="small" /> Members
          {memberWatch.length > 0 && `(${memberWatch.length})`}
        </Button>
        <Button
          color={lableWatch.length > 0 ? "success" : "default"}
          onClick={(event) => setLabelPopover(event.currentTarget)}
        >
          <LabelIcon fontSize="small" /> Labels
          {lableWatch.length > 0 && `(${lableWatch.length})`}
        </Button>
        <Button onClick={(event) => setDatePopover(event.currentTarget)}>
          <CalendarMonth fontSize="small" />{" "}
          {differenceInDays(dateRangeWatch.startDate, dateRangeWatch.endDate) ==
          0
            ? dateRangeWatch.startDate.toDateString()
            : `${dateRangeWatch.startDate.toDateString()} - ${dateRangeWatch.endDate.toDateString()}`}
        </Button>

        <Button color={"danger"} onClick={resetDefaultHandle}>
          Reset
        </Button>

        {columnPopover && (
          <BasePopover
            anchorElement={columnPopover}
            closeCallback={() => {
              setColumnPopover(null);
              handleSubmitHandle();
            }}
            title="Columns"
            contents={
              <BaseSelectItems
                items={allLists.map((s) => ({
                  id: s._id,
                  name: s.title,
                }))}
                selectedItems={columnsWatch}
                handleItemClick={(item) => {
                  const columns = getValues("columns");
                  if (columns.includes(item.id)) {
                    setValue(
                      "columns",
                      columns.filter((s) => s !== item.id)
                    );
                  } else {
                    setValue("columns", [...columns, item.id]);
                  }
                }}
              />
            }
          />
        )}

        {memberPopover && (
          <BasePopover
            anchorElement={memberPopover}
            closeCallback={() => {
              setMemberPopover(null);
              handleSubmitHandle();
            }}
            title="Members"
            contents={
              <MembersPopover
                members={board.members}
                selectedItems={memberWatch}
                handleItemClick={(item) => {
                  const members = getValues("members");
                  if (members.includes(item.user)) {
                    setValue(
                      "members",
                      members.filter((s) => s !== item.user)
                    );
                  } else {
                    setValue("members", [...members, item.user]);
                  }
                }}
              />
            }
          />
        )}
        {labelPopover && (
          <BasePopover
            anchorElement={labelPopover}
            closeCallback={() => {
              setLabelPopover(null);
              handleSubmitHandle();
            }}
            contents={
              <LabelsPopover
                labels={board.labels}
                selectedItems={lableWatch}
                handleItemClick={(item) => {
                  const labels = getValues("labels");
                  if (labels.includes(item._id)) {
                    setValue(
                      "labels",
                      labels.filter((s) => s !== item._id)
                    );
                  } else {
                    setValue("labels", [...labels, item._id]);
                  }
                }}
              />
            }
          />
        )}
        {dateRangePopover && (
          <BasePopover
            anchorElement={dateRangePopover}
            closeCallback={() => {
              setDatePopover(null);
              handleSubmitHandle();
            }}
            contents={
              <DateRangePicker
                value={dateRangeWatch}
                onChange={(e) => setValue("dateRange", e)}
              />
            }
          />
        )}
      </TopRightWrapper>
    </Container>
  );
};
