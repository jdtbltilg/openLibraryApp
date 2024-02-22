import React, { useState, useEffect, useCallback, ChangeEventHandler } from "react";
import { IDoc, IOpenLibraryOrgResults } from '../Types/OpenLibraryTypes'
import TextField from '@mui/material/TextField';
import _debounce from 'lodash/debounce';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const BookSearch: React.FC = () => {
    const [searchResults, setSearchResults] = useState<IOpenLibraryOrgResults | null>(null);
    const [autoCompleteOptions, setAutoCompleteOptions] = useState<IDoc[] | []>([]);
    const debounceFn = useCallback(_debounce(search, 500), []);
    const [loading, setLoading] = useState(false)
    const [searchFor, setSearchFor] = useState("")
    const [sortBy, setSortBy] = useState("Relevance")
    
    useEffect(() => {
        (async () => {await search(searchFor, sortBy)})()
    }, [sortBy]);

    async function search(searchValue: string, sort: string) {
        setLoading(true)
        setSearchFor(searchValue)
        const sortValue = sort === "old" ? "&sort=old" : ""
        const data = await fetch(`https://openlibrary.org/search.json?q=${searchValue}${sortValue}`, {
            method: "GET"
        });
        const jsonData = await data.json();
        setSearchResults(jsonData);
        setLoading(false)
    };

    function handleChange (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        debounceFn(event.target.value, sortBy);
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSortBy(event.target.value);
      };

    useEffect(() => {
        if(searchResults){
            setAutoCompleteOptions(searchResults.docs)
        }
        
    }, [searchResults]);

    return (
        <>
        <Box sx={{ flexGrow: 1, padding: 2 }}>
        <Grid container direction="row" justifyContent="center" alignItems="center">
            <Grid item xs={3}>
                <TextField id="outlined-basic" label="Search for a book" variant="outlined" onChange={handleChange} />
            </Grid>
            <Grid item xs={3}>
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">Sort</FormLabel>
                            <RadioGroup row aria-labelledby="demo-row-radio-buttons-group-label" 
                                name="row-radio-buttons-group"
                                value={sortBy}
                                onChange={handleSortChange}>
                                <FormControlLabel value="Relevance" control={<Radio />} label="Relevance" />
                                <FormControlLabel value="old" control={<Radio />} label="Publish Date" />                        
                            </RadioGroup>
                    </FormControl>
            </Grid>
        </Grid>
        <Box sx={{ flexGrow: 1, padding: 2 }}>
            {loading && (
                <LinearProgress />
            )}
        </Box>
        <Grid container rowSpacing={2} columnSpacing={2}>
            {autoCompleteOptions.map((book: IDoc) => (
                <Grid item xs={4}>
                    <Item>
                        <Typography variant="h6" color="text.primary">
                            {book.title}
                        </Typography>                        
                        <Typography variant="subtitle1" color="text.primary">
                            by {book.author_name}                            
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            First Published {book.first_publish_year} | {book.number_of_pages_median} pages
                        </Typography>
                        <Divider />
                        <div style={{height: '100px', overflow: 'scroll', textAlign: 'left'}}>
                            <Typography variant="caption">
                                isbn: {(book.isbn) ? book.isbn.join(', ') : '' }
                            </Typography>
                        </div>
                    </Item>
                </Grid>
            ))}
        </Grid></Box>
        </>
    );
  };
  
  export default BookSearch;