import { Box, Button, FormControl, MenuItem, Pagination, Select } from "@mui/material"
import { useMemo, useState, useRef, useEffect, useLayoutEffect } from "react"
import useQueryParam from "../hooks/useQueryParam"
import SearchForm from "./SearchForm"

export interface IFilterObj {
  search: string
  sort: string
  page: number
}

interface IProps {
  totalPages: number
  sortItems: { value: string, label: string }[]
  onTriggerFetch: (filterObj: IFilterObj) => void
}

export default ({ onTriggerFetch, totalPages, sortItems }: IProps) => {
  const [filterObjParam, setFilterObjParam] = useQueryParam('filterObj')

  const parsedFilterObjParam = useMemo((): IFilterObj => {
    try {
      return JSON.parse(filterObjParam as string)
    } catch {
      return {
        page: 1,
        search: '',
        sort: sortItems[0].value
      }
    }
  }, [filterObjParam])

  const [filterObj, setFilterObj] = useState(parsedFilterObjParam)

  const firstUpdate = useRef(true)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    setFilterObjParam(JSON.stringify(filterObj))
  }, [filterObj])
  
  useEffect(() => {
    onTriggerFetch({
      page: filterObj.page,
      sort: filterObj.sort,
      search: filterObj.search
    })
  }, [filterObj])

  return (
    <Box>
      <SearchForm
        value={filterObj.search!}
        onChange={(e) => setFilterObj({ ...filterObj, page: 1, search: (e.target as any).value })}
      />

      <Box sx={{ mt: '20px', display: 'flex', alignItems: 'center', columnGap: '15px' }}>
        <FormControl size="small">
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={filterObj.sort}
            onChange={(e) => setFilterObj({ ...filterObj, page: 1, sort: e.target.value as IFilterObj['sort'] })}
          >
            {
              sortItems.map((item) => (
                <MenuItem value={item.value}>
                  {item.label}
                </MenuItem>
              ))
            }
          </Select>
        </FormControl>

        <Button variant="contained" onClick={() => onTriggerFetch(filterObj)}>
          Reload
        </Button>

        <Pagination
          sx={{ ml: 'auto' }}
          count={totalPages}
          page={filterObj.page}
          onChange={(_, value) => setFilterObj({ ...filterObj, page: value })}
          size="medium"
          variant="outlined"
          shape="rounded"
          color="primary"
        />
      </Box>
    </Box>
  )
}
